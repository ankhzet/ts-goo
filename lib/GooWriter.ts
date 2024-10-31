import type {
    GlobalConfig,
    Goo,
    GooHeader,
    GooLayer,
    GooLayersConfig,
    GooPreview,
    GooSummary,
    LayerDefinition,
    LiftRetract,
    MotionConfig,
    Motions,
    MotionTimes,
    PrinterDefinition,
} from './interfaces.js';
import { formatDate, rgb565Buffer } from './utils.js';
import { rleEncode } from './rle/index.js';
import { GOO_DELIMITER, GOO_MAGIC, GOO_TAIL, GOO_VERSION } from './magics.js';
import { loadPreview, loadSlice } from './loaders.js';
import { BinaryWriter } from './BinaryWriter.js';
import { CRC8 } from './CRC8.js';

const GENERATOR = {
    description: 'AnkhZet Elegoo .goo file format reader/writer',
    version: '0.0.1',
};

export class GooWriter {
    protected writer: BinaryWriter;

    public constructor(writer: BinaryWriter) {
        this.writer = writer;
    }

    public async write(goo: Goo, consumer: (buffer: Buffer) => Promise<unknown>): Promise<number> {
        let offset = 0;

        const consume = async (buffer: Buffer) => {
            offset += buffer.length;
            return consumer(buffer);
        };

        for await (const buffer of this.writeData(goo)) {
            await consume(
                (buffer instanceof Buffer)
                    ? buffer
                    : buffer(offset),
            );
        }

        return offset;
    }

    protected async* writeData(goo: Goo) {
        yield* this.writer.string(GOO_VERSION, 4);
        yield* this.writer.binary(GOO_MAGIC);

        yield* this.writeHeader(goo.header);

        for (const layer of goo.layers) {
            yield* this.writeLayer(layer, goo.header.printer);
        }

        yield* this.writer.u24(GOO_TAIL);
        yield* this.writer.binary(GOO_MAGIC);

        yield* this.writer.flush();
    }

    protected async* writeHeader(header: GooHeader) {
        const generator = header.generator || GENERATOR;

        yield* this.writer.string(generator.description, 32);
        yield* this.writer.string(generator.version, 24);

        yield* this.writer.string(formatDate(header.date), 24);

        yield* this.writer.string(header.printer.name, 32);
        yield* this.writer.string(header.printer.type, 32);
        yield* this.writer.string(header.printer.resinProfile, 32);

        yield* this.writer.u16(header.printer.antialiasing);
        yield* this.writer.u16(header.printer.gray);
        yield* this.writer.u16(header.printer.blur);

        for (const preview of header.previews) {
            yield* this.writePreview(preview);
        }

        yield* this.writer.flush();

        yield* this.writer.u32(header.layers);
        yield* this.writer.u16(header.printer.resolution.x);
        yield* this.writer.u16(header.printer.resolution.y);
        yield* this.writer.bool(header.printer.mirror.x);
        yield* this.writer.bool(header.printer.mirror.y);
        yield* this.writer.f32(header.printer.platform.x);
        yield* this.writer.f32(header.printer.platform.y);
        yield* this.writer.f32(header.printer.platform.z);

        yield* this.writer.flush();

        yield* this.writeLayerConfig(header.layerConfig);

        yield* this.writer.flush();

        yield* this.writeSummary(header.summary);

        yield* this.mark(7);

        yield* this.writer.bool(header.printer.grayscale);
        yield* this.writer.u16(header.layerConfig.transitionLayers);

        yield* this.writer.flush();
    }

    protected* mark(offset: number) {
        yield* this.writer.flush();
        yield (pos: number) => Buffer.from(Uint32Array.of(pos + offset).buffer).reverse();
    }

    protected* writeLayerConfig(config: GooLayersConfig) {
        yield* this.writer.f32(config.thickness);
        yield* this.writer.f32(config.commonExposure);
        yield* this.writer.bool(config.exposureDelay);

        yield* this.writer.f32(config.turnOffTime);

        yield* this.writeGlobalConfig(config.timings, (i) => this.writeMotionTimes(i));

        yield* this.writer.f32(config.bottomExposure);
        yield* this.writer.u32(config.bottomLayers);

        yield* this.writeMotions(config.motions, (motion) => (
            this.writeLiftRetract(motion, (lr) => (
                this.writeGlobalConfig(lr, (c) => this.writeMotionConfig(c))
            ))
        ));

        yield* this.writer.u16(config.pwm.bottom);
        yield* this.writer.u16(config.pwm.common);

        yield* this.writer.bool(config.advance);
    }

    protected* writeSummary(summary: GooSummary) {
        yield* this.writer.u32(summary.time);
        yield* this.writer.f32(summary.volume);
        yield* this.writer.f32(summary.weight);
        yield* this.writer.f32(summary.price);
        yield* this.writer.string(summary.currency, 8);
    }

    protected* writeGlobalConfig<T>(config: GlobalConfig<T>, map: (item: T) => Generator<Buffer>) {
        yield* map(config.bottom);
        yield* map(config.common);
    }

    protected* writeMotions<T>(config: Motions<T>, map: (item: T) => Generator<Buffer>) {
        yield* map(config.first);
        yield* map(config.second);
    }

    protected* writeLiftRetract<T>(config: LiftRetract<T>, map: (item: T) => Generator<Buffer>) {
        yield* map(config.lift);
        yield* map(config.retract);
    }

    protected* writeMotionTimes(times: MotionTimes) {
        yield* this.writer.f32(times.before.lift);
        yield* this.writer.f32(times.after.lift);
        yield* this.writer.f32(times.after.retract);
    }

    protected* writeMotionConfig(config: MotionConfig) {
        yield* this.writer.f32(config.distance);
        yield* this.writer.f32(config.speed);
    }

    protected async* writePreview(preview: GooPreview): AsyncGenerator<Buffer> {
        yield* this.writer.flush();

        const { buffer, channels } = (
            typeof preview.input === 'string'
                ? await loadPreview(preview.input, preview.dimensions)
                : preview.input
        );
        yield rgb565Buffer(buffer, channels);
        yield* this.writeDelimiter();
    }

    protected* writeDelimiter() {
        yield* this.writer.u16(GOO_DELIMITER);
    }

    protected async* writeLayer(layer: GooLayer, printer: PrinterDefinition) {
        const slice = (
            typeof layer.slice === 'string'
                ? await loadSlice(layer.slice, layer.transform, printer)
                : layer.slice
        );
        const buffer = rleEncode(slice.buffer, slice.channels);

        yield* this.writeLayerDefinition(layer.definition);
        yield* this.writer.u32(buffer.length + 2);
        yield* this.writer.u8(0x55);
        yield* this.writer.flush();
        yield buffer;
        yield* this.writer.u8((new CRC8()).checksum(buffer));
        yield* this.writeDelimiter();
    }

    protected* writeLayerDefinition(definition: LayerDefinition) {
        yield* this.writer.u16(definition.pause.mode);
        yield* this.writer.f32(definition.pause.z);

        yield* this.writer.f32(definition.z);
        yield* this.writer.f32(definition.exposure);
        yield* this.writer.f32(definition.offTime);

        yield* this.writeMotionTimes(definition.times);
        yield* this.writeLiftRetract(definition.motions, (m) => (
            this.writeMotions(m, (lr) => (
                this.writeMotionConfig(lr)
            ))
        ));

        yield* this.writer.u16(definition.pwm);
        yield* this.writeDelimiter();
    }
}
