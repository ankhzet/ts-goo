import sharp from 'sharp';

import { SliceTransform, PrinterDefinition, MotionConfig, GooLayer } from './interfaces.js';

const format = new Intl.DateTimeFormat('en-EN', {
    hourCycle: 'h24',
    day: '2-digit',
    year: 'numeric',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const INCHES_PER_MM = 0.0393701;

export const chunk = (str: string, chunk: number) => (
    Array(Math.ceil(str.length / chunk))
        .fill(0).map((_, index) => index * chunk).map((begin) => str.slice(begin, begin + chunk))
);

export const printBuffer = (buffer: Buffer) => {
    console.log(
        buffer.length.toString().padStart(7, ' ') + ' |',
        chunk(buffer.toString('hex', 0, 16).padEnd(32, ' '), 2).map((i) => (i === '00' ? '  ' : (i === '  ' ? '__' : i))).join(' '),
        '| ' + buffer.toString('utf8', 0, 32).replace(/[^\w \p{P}]/gu, ' '),
    );
};

export const formatDate = (date: Date) => {
    const parts = format.formatToParts(date);
    const find = (n: Intl.DateTimeFormatPartTypes) => parts.find(({ type }) => type === n)?.value;

    return `${find('year')}-${find('month')}-${find('day')} ${find('hour')}:${find('minute')}:${find('second')}`;
}

export const formatBytes = (data: number, len: number = 1) => '0x' + data.toString(16).padStart(2 * len, '0');

export const rgb565 = (rgba: number) => {
    const r = (rgba >> 8) & 0xFF;
    const g = (rgba >> 16) & 0xFF;
    const b = (rgba >> 24) & 0xFF;
    const r1 = ~~(r / 8);
    const g1 = ~~(g / 4);
    const b1 = ~~(b / 8);

    return ((r1) | (g1 << 5) | (b1 << 11)) >>> 0;
}

export const rgba8888 = (rgb: number) => {
    const r = (rgb >> 0) & 0b11111;
    const g = (rgb >> 5) & 0b111111;
    const b = (rgb >> 11) & 0b11111;
    const r1 = r * 8;
    const g1 = g * 4;
    const b1 = b * 8;

    return ((r1 << 8) | (g1 << 16) | (b1 << 24) | 0xFF) >>> 0;
}

export const rgb565Buffer = (buffer: Buffer, channels: number) => {
    // RGB_565, 32, 64, 32, (/8, /4, /8)
    let offset = 0;
    let pos = 0;
    const total = buffer.length;
    const pixels = ~~(total / channels);
    const target = Buffer.alloc(2 * pixels);

    while (offset < total) {
        target.writeUInt16BE(rgb565(buffer.readUint32BE(offset)), pos);

        offset += channels;
        pos += 2;
    }

    return target;
};

export const rgba8888Buffer = (buffer: Buffer): Buffer => {
    // RGB_565, 32, 64, 32, (/8, /4, /8)
    let offset = 0;
    let pos = 0;
    const total = buffer.length;
    const pixels = ~~(total / 2);
    const target = Buffer.alloc(4 * pixels);

    while (offset < total) {
        target.writeUInt32BE(rgba8888(buffer.readUint16BE(offset)), pos);

        offset += 2;
        pos += 4;
    }

    return target;
};

export const bit = (value: number, width: number) => value.toString(2).padStart(width, '0');

export const promisify = <U extends any[]>(fn: (cb: (error: unknown, ...args: U) => void) => void) =>
    new Promise<U>((resolve, reject) => {
        fn((error: unknown, ...args: U) => {
            if (error) {
                reject(error);
            } else {
                resolve(args);
            }
        });
    });

export const sizeInCoordinateSystem = (
    { resolution, platform }: PrinterDefinition,
    { density, width, height }: sharp.Metadata
) => {
    const widthPixelPerMM = resolution.x / platform.x;
    const heightPixelPerMM = resolution.y / platform.y;
    const scaler = density! * INCHES_PER_MM;
    const mmWidth = width! / scaler;
    const mmHeight = height! / scaler;

    return {
        width: Math.round(widthPixelPerMM * mmWidth),
        height: Math.round(heightPixelPerMM * mmHeight),
    };
};

export const transformInCoordinateSystem = (
    printer: PrinterDefinition,
    transform: SliceTransform | undefined,
    metadata: sharp.Metadata
) => {
    const { translate: { x, y } = { x: 0, y: 0 }, scale = { x: 1, y: 1 } } = transform || {};
    const size = sizeInCoordinateSystem(printer, metadata);
    const width = Math.round(size.width * scale.x);
    const height = Math.round(size.height * scale.y);

    return {
        x,
        y,
        width,
        height,
    };
};

export const assert: (value: unknown, message: string) => asserts value = (value: unknown, message: string) => {
    if (!value) {
        throw new Error(message);
    }
};

const motionTime = (config: MotionConfig) => config.distance / (config.speed || 1);

export const layerTime = ({ definition: { exposure, times, motions } }: GooLayer) => (
    exposure +
    (times.before.lift + times.after.lift + times.after.retract) +
    (motionTime(motions.lift.first) + motionTime(motions.lift.second) + motionTime(motions.retract.first) + motionTime(motions.retract.second))
);

