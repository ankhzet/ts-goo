import type {
    Goo,
    GooHeader,
    Vec2,
    GooLayersConfig,
    GlobalConfig,
    Motions,
    LiftRetract,
    MotionConfig,
    GooLayer,
    LayerDefinition,
    GooPreview,
} from './interfaces';
import { assert, rgba8888Buffer, formatBytes } from './utils';
import { GOO_VERSION, GOO_MAGIC, GOO_DELIMITER } from './magics';
import { BinaryReader } from './BinaryReader';
import { rleDecode } from './rle';
import { CRC8 } from './CRC8';

export class GooReader {
    protected reader: BinaryReader;

    public constructor(reader: BinaryReader) {
        this.reader = reader;
    }

    public async read(): Promise<Goo> {
        const version = await this.reader.string(4);
        assert(version === GOO_VERSION, `Version "${version}" is not supported`);

        await this.reader.assert(GOO_MAGIC, 'File signature mismatch');
        const header = await this.readHeader();
        const layers: GooLayer[] = [];

        let i = header.layers;

        while (i-- > 0) {
            layers.push(
                await this.readLayer()
            );
        }

        assert((await this.reader.u24()) === 0, 'File tail signature mismatch');
        await this.reader.assert(GOO_MAGIC, 'File tail signature mismatch');

        return {
            header,
            layers,
        };
    }

    protected async readHeader(): Promise<GooHeader> {
        const generator = await this.reader.struct({}, {
            description: () => this.reader.string(32),
            version: () => this.reader.string(24),
        });
        const date = new Date(await this.reader.string(24));

        const printJob = await this.reader.struct({ grayscale: true }, {
            name: () => this.reader.string(32),
            type: () => this.reader.string(32),
            resinProfile: () => this.reader.string(32),
            antialiasing: () => this.reader.u16(),
            gray: () => this.reader.u16(),
            blur: () => this.reader.u16(),
        });

        const previews = [];

        for (const size of [116, 290]) {
            previews.push(await this.readPreview({ x: size, y: size }));
        }

        const layers = await this.reader.u32();

        const printer = await this.reader.struct(printJob, {
            resolution: () => this.reader.struct({}, {
                x: () => this.reader.u16(),
                y: () => this.reader.u16(),
            }),
            mirror: () => this.reader.struct({}, {
                x: () => this.reader.bool(),
                y: () => this.reader.bool(),
            }),
            platform: () => this.reader.struct({}, {
                x: () => this.reader.f32(),
                y: () => this.reader.f32(),
                z: () => this.reader.f32(),
            })
        });

        const layerConfig = await this.readLayerConfig();
        const summary = await this.readSummary();
        const next = await this.reader.u32();

        printer.grayscale = await this.reader.bool();
        layerConfig.transitionLayers = await this.reader.u16();

        return {
            date,
            generator,
            printer,
            previews,
            layers,
            layerConfig,
            summary,
            next,
        };
    }

    protected async readLayerConfig(): Promise<GooLayersConfig> {
        return this.reader.struct({ transitionLayers: 0 }, {
            thickness: () => this.reader.f32(),
            commonExposure: () => this.reader.f32(),
            exposureDelay: () => this.reader.bool(),
            turnOffTime: () => this.reader.f32(),
            timings: () => this.readGlobalConfig(() => this.readMotionTimes()),
            bottomExposure: () => this.reader.f32(),
            bottomLayers: () => this.reader.u32(),
            motions: () => this.readMotions(() => (
                this.readLiftRetract(() => (
                    this.readGlobalConfig(() => this.readMotionConfig())
                ))
            )),
            pwm: () => this.reader.struct({}, {
                bottom: () => this.reader.u16(),
                common: () => this.reader.u16(),
            }),
            advance: () => this.reader.bool(),
        });
    }

    protected async readSummary() {
        return this.reader.struct({}, {
            time: () => this.reader.u32(),
            volume: () => this.reader.f32(),
            weight: () => this.reader.f32(),
            price: () => this.reader.f32(),
            currency: () => this.reader.string(8),
        });
    }

    protected async readGlobalConfig<T>(map: () => Promise<T>): Promise<GlobalConfig<T>> {
        return {
            bottom: await map(),
            common: await map(),
        };
    }

    protected async readMotions<T>(map: () => Promise<T>): Promise<Motions<T>> {
        return {
            first: await map(),
            second: await map(),
        };
    }

    protected async readLiftRetract<T>(map: () => Promise<T>): Promise<LiftRetract<T>> {
        return {
            lift: await map(),
            retract: await map(),
        };
    }

    protected async readMotionTimes() {
        return this.reader.struct({}, {
            before: () => this.reader.struct({}, {
                lift: () => this.reader.f32(),
            }),
            after: () => this.reader.struct({}, {
                lift: () => this.reader.f32(),
                retract: () => this.reader.f32(),
            }),
        });
    }

    protected async readMotionConfig(): Promise<MotionConfig> {
        return {
            distance: await this.reader.f32(),
            speed: await this.reader.f32(),
        };
    }

    protected async readPreview(dimensions: Vec2<number>): Promise<GooPreview & { input: { buffer: Buffer; channels: 4 } }> {
        const { buffer } = await this.reader.binary(2 * dimensions.x * dimensions.y);
        await this.readDelimiter();

        return {
            dimensions,
            input: {
                buffer: rgba8888Buffer(buffer),
                channels: 4,
            },
        };
    }

    protected async readDelimiter() {
        assert((await this.reader.u16()) === GOO_DELIMITER, 'Delimiter expected');
    }

    protected async readLayer(): Promise<GooLayer> {
        const definition = await this.readLayerDefinition();
        const offset = await this.reader.u32();
        const marker = await this.reader.u8();

        assert(marker === 0x55, `Layer data marker expected, got ${formatBytes(marker)}`);

        const { buffer } = await this.reader.binary(offset - 2);
        const crc = await this.reader.u8();
        const checksum = (new CRC8()).checksum(buffer);
        await this.readDelimiter();

        assert(checksum === crc, `CRC mismatch, expected ${formatBytes(crc)}, got ${formatBytes(checksum)}`);

        return {
            definition,
            slice: {
                buffer: rleDecode(buffer),
                channels: 1,
            },
        };
    }

    protected async readLayerDefinition(): Promise<LayerDefinition> {
        const definition = await this.reader.struct({}, {
            pause: () => this.reader.struct({}, {
                mode: () => this.reader.u16(),
                z: () => this.reader.f32(),
            }),
            z: () => this.reader.f32(),
            exposure: () => this.reader.f32(),
            offTime: () => this.reader.f32(),
            times: () => this.readMotionTimes(),
            motions: () => this.readLiftRetract(() => (
                this.readMotions(() => (
                    this.readMotionConfig()
                ))
            )),
            pwm: () => this.reader.u16(),
        });
        await this.readDelimiter();

        return definition;
    }
}


