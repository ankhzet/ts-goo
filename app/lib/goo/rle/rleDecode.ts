export const rleDecode = (buffer: Buffer) => {
    const slice = 5 * 1024 * 1024;
    let pos = 0;
    let offset = 0;
    let total = buffer.length;

    const arrays: Uint8Array[] = [];
    let arr = new Uint8Array(slice);

    const flush = (init: boolean) => {
        arrays.push(arr.slice(0, pos));

        if (init) {
            pos = 0;
            arr = new Uint8Array(slice);
        }
    };
    const consume = (pixel: number, count: number) => {
        if (pixel) {
            while (count-- > 0) {
                if (pos + 1 > slice) {
                    flush(true);
                }

                arr[pos++] = pixel;
            }
        } else {
            while (count > slice - pos) {
                const delta = slice - pos;
                pos += delta;
                count -= delta;
                flush(true);
            }

            pos += count;
        }
    };

    let prev = 0;

    while (offset < total) {
        const byte0 = buffer.readUint8(offset++);
        const type = (byte0 >> 6) & 0b11;
        const isPlain = (!type) || type === 0b11;
        const isLen = type === 0b01;
        let len = (byte0 >> 4) & 0b11;
        let count = byte0 & 0b1111;
        let pixel = 0;

        if (isPlain) {
            if (type) {
                pixel = 0xFF;
            }
        } else if (isLen) {
            pixel = buffer.readUint8(offset++);
        } else {
            pixel = prev + ((len > 1) ? -count : count);
            count = (len % 1) ? buffer.readUint8(offset++) : 0;
            len = 0;
        }

        if (len) {
            let added = 0;

            while (len-- > 0) {
                added = (added << 8) | buffer.readUint8(offset++);
            }

            count |= added << 4;
        }

        consume(pixel, count);
    }

    flush(false);

    return Buffer.concat(arrays);
};
