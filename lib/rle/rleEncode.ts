import { encoder } from './encoder.js';

export const rleEncode = (buffer: Buffer, channels: number): Buffer => {
    let offset = 0;
    let total = buffer.length;

    const { encode, flush } = encoder();

    let pixel = buffer.readUint8(0);
    let length = 0;
    let diff = 0;
    let byte = 0;

    while (offset <= total) {
        if (offset < total) {
            byte = buffer.readUint8(offset);
            offset += channels;

            if (byte === pixel) {
                length++;
                continue;
            }
        } else {
            offset++;
        }

        encode(pixel, length, diff);
        pixel = byte;
        length = 1;
        diff = byte - pixel;
    }

    return flush();
};
