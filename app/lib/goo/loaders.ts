import sharp from 'sharp';

import type { Vec2, SliceTransform, PrinterDefinition, ImageDescriptor } from './interfaces';
import { promisify, transformInCoordinateSystem } from './utils';

export const loadPreview = async (pathname: string, { x, y }: Vec2<number>) => (
    sharp(pathname, { pages: 1 })
        .resize({
            width: x,
            height: y,
            fit: 'contain',
            withoutEnlargement: false,
            withoutReduction: false,
            kernel: 'lanczos3',
        })
        .raw({
            depth: 'uchar',
        })
        .toBuffer({ resolveWithObject: true })
        .then(({ data: buffer, info }) => ({
            buffer,
            channels: info.channels,
        }))
);

const sliceCanvas = ({ resolution: { x, y } }: PrinterDefinition): { create: sharp.Create } => ({
    create: {
        width: x,
        height: y,
        channels: 4,
        background: '#000000',
    },
});

export const loadSlice = async (
    pathname: string,
    transform: SliceTransform | undefined,
    printer: PrinterDefinition
) => {
    const [buffer, info] = await promisify<[buffer: Buffer, info: sharp.OutputInfo]>(async (cb) => {
        const slice = sharp(pathname);
        const { x: left, y: top, width, height } = transformInCoordinateSystem(
            printer,
            transform,
            await slice.metadata(),
        );

        sharp(sliceCanvas(printer))
            .composite([{
                input: await (
                    slice
                        .resize({
                            width,
                            height,
                            fit: 'contain',
                            withoutEnlargement: false,
                            withoutReduction: false,
                            kernel: 'lanczos3',
                            background: transform?.invert ? '#ffffff' : '#000000',
                        })
                        .negate(transform?.invert || false)
                        .toBuffer()
                ),
                left,
                top,
            }])
            .grayscale()
            .raw({
                depth: 'uchar',
            })
            .toBuffer(cb)
    });

    return {
        buffer,
        channels: info.channels,
    };
};

export const saveImage = ({ dimensions, input, pathname }: {
    dimensions: Vec2<number>;
    input: ImageDescriptor;
    pathname: string;
}) => {
    if (typeof input === 'string') {
        return sharp(input).toFile(pathname);
    }

    return (
        sharp(input.buffer, {
            raw: {
                width: dimensions.x,
                height: dimensions.y,
                channels: input.channels,
            },
        })
            .toFile(pathname)
    );
}
