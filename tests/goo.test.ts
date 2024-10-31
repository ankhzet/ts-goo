import path from 'node:path';
import fs from 'node:fs/promises';

import type { Goo, GooLayer, GooPreview, PrinterDefinition, SliceTransform } from '../lib';
import { BinaryReader, BinaryWriter, GooReader, GooWriter, saveImage } from '../lib';
import { layerTime, printBuffer } from '../lib/utils';
import { description, version } from '../package.json' assert { type: 'json' };

const PRINTER_MARS_4_ULTRA_9K: PrinterDefinition = {
    name: 'ELEGOO Mars 4 Ultra 9K',
    type: 'MSLA',
    resolution: { x: 8520, y: 4320 },
    platform: { x: 153.36, y: 77.76, z: 165 },
    mirror: { x: true, y: false },
    resinProfile: 'PCB',
    grayscale: true,
    antialiasing: 4,
    blur: 2,
    gray: 5,
};

const makeGoo = (printer: PrinterDefinition, previews: GooPreview[], layers: GooLayer[]): Goo => {
    return {
        header: {
            date: new Date(),
            generator: {
                description,
                version,
            },
            printer,
            previews,
            layers: layers.length,

            layerConfig: {
                bottomLayers: 1,
                transitionLayers: 1,
                thickness: 0.05,
                bottomExposure: 10,
                commonExposure: 10,
                exposureDelay: true,
                turnOffTime: 0.1,
                advance: false,
                timings: {
                    bottom: {
                        before: {
                            lift: 0,
                        },
                        after: {
                            lift: 0,
                            retract: 0,
                        },
                    },
                    common: {
                        before: {
                            lift: 0,
                        },
                        after: {
                            lift: 0,
                            retract: 0,
                        },
                    },
                },
                motions: {
                    first: {
                        lift: {
                            bottom: {
                                distance: 5.0,
                                speed: 65.0,
                            },
                            common: {
                                distance: 5.0,
                                speed: 65.0,
                            },
                        },
                        retract: {
                            bottom: {
                                distance: 5.0,
                                speed: 150.0,
                            },
                            common: {
                                distance: 5.0,
                                speed: 150.0,
                            },
                        },
                    },
                    second: {
                        lift: {
                            common: {
                                distance: 0,
                                speed: 0,
                            },
                            bottom: {
                                distance: 0,
                                speed: 0,
                            },
                        },
                        retract: {
                            common: {
                                distance: 0,
                                speed: 0,
                            },
                            bottom: {
                                distance: 0,
                                speed: 0,
                            },
                        },
                    },
                },
                pwm: {
                    bottom: 255,
                    common: 255,
                },
            },
            summary: {
                price: 9.99,
                currency: '₴',
                time: layers.reduce((acc, layer) => acc + layerTime(layer), 0),
                volume: 100.0,
                weight: 100.0,
            },
        },
        layers,
    };
};

const makeLayer = ({ imagePath: slice, exposure, height, z, transform }: {
        imagePath: string;
        exposure: number;
        z: number;
        height: number;
        transform?: SliceTransform;
    },
): GooLayer => ({
    definition: {
        pause: {
            mode: 0,
            z: 100,
        },
        z: z + height,
        exposure,
        offTime: 0.1,
        times: {
            before: {
                lift: 0,
            },
            after: {
                lift: 0,
                retract: 0,
            },
        },
        motions: {
            lift: {
                first: {
                    distance: 5.0,
                    speed: 65.0,
                },
                second: {
                    distance: 0,
                    speed: 0,
                },
            },
            retract: {
                first: {
                    distance: 5.0,
                    speed: 150.0,
                },
                second: {
                    distance: 0,
                    speed: 0,
                },
            },
        },
        pwm: 255,
    },
    slice,
    transform,
});

const makeLayers = (n: number, { resolution: { x: width } }: PrinterDefinition) => {
    const layer = 0.05;
    const scale = { x: 1 / n, y: 1 / n };
    const deltaX = ~~(width / n);

    return Array(n).fill(0).map((_, index) => {
        return makeLayer({
            imagePath: slicePath,
            height: layer,
            z: index * layer,
            exposure: Math.pow(2, n - index - 1),
            transform: {
                invert: false,
                translate: {
                    x: index * deltaX,
                    y: 0,
                },
                scale,
                rotate: {
                    angle: 0,
                    origin: { x: 0, y: 0 },
                },
            },
        });
    });
};

const readBack = process.argv.indexOf('--read');
const slicePath = path.resolve(process.argv[2]);
const outPath = path.resolve('.data/test.goo');
const binaryWriter = new BinaryWriter(1024 * 1024);
const gooWriter = new GooWriter(binaryWriter);
const previews = [116, 290].map((size): GooPreview => ({
    dimensions: { x: size, y: size },
    input: slicePath,
}));
const goo = makeGoo(PRINTER_MARS_4_ULTRA_9K, previews, makeLayers(1, PRINTER_MARS_4_ULTRA_9K));

await fs.rm(outPath, { force: true });
const out = await fs.open(outPath, 'w+');

try {
    await gooWriter.write(goo, (buffer) => out.write(buffer));
} finally {
    await out.close();
}

if (readBack) {
    const binaryReader = new BinaryReader(await fs.open(outPath));
    const gooReader = new GooReader(binaryReader);

    const read = await gooReader.read();
    console.log(read);

    for (const { dimensions, input } of read.header.previews) {
        await saveImage({
            input,
            dimensions: dimensions,
            pathname: path.resolve(`.data/preview-${dimensions.x}x${dimensions.y}.png`),
        });
    }

    for (const [index, { slice }] of read.layers.entries()) {
        await saveImage({
            input: slice,
            dimensions: goo.header.printer.resolution,
            pathname: path.resolve(`.data/layer-${index}.png`),
        });
    }
}
