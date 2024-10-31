export type RollingBufferOptions = {
    slice: number;
    buffer: number;
};

export const roll = ({ slice, buffer }: RollingBufferOptions) => {
    const bytes = Array(buffer).fill(0);
    const arrays: Uint8Array[] = [];
    let target = new Uint8Array(slice);
    let offset = slice;

    const write = (count: number) => {
        if (offset + count > slice) {
            arrays.push(target.slice(0, offset));
            target = new Uint8Array(slice);
            offset = 0;
        }

        let i = -1;

        while (++i < count) {
            target[offset++] = bytes[i];
        }
    };

    return {
        bytes,
        write,
        flush() {
            if (offset) {
                arrays.push(target.slice(0, offset));
            }

            return Buffer.concat(arrays);
        },
    };
};

export const encoder = () => {
    const { bytes, write, flush } = roll({
        slice: 1024 * 10,
        buffer: 8,
    })

    return {
        flush,
        encode: (pixel: number, count: number, diff: number) => {
            const c = count >>> 0;
            const remainder = c % (1 << 4);
            const rest = c >> 4;
            const len = rest ? ~~((31 - Math.clz32(rest)) / 8) + 1 : 0;
            const isPlain = (!pixel) || (pixel === 0xFF);
            const type = isPlain ? (pixel ? 0b11000000 : 0b00000000) : 0b01000000;
            const offset = isPlain ? 1 : 2;
            const byte0 = ((len & 0b11) << 4) | remainder | type;
            const total = offset + len;

            // console.log('add', {
            //     count,
            //     rest,
            //     remainder,
            //     len,
            //     e: bit(rest, 8) + ' + ' + bit(remainder, 4),
            //     byte0: bit(byte0 | type, 8),
            // });

            bytes[0] = byte0;

            if (!isPlain) {
                bytes[1] = pixel;
            }

            if (len) {
                if (len === 2) {
                    bytes[offset] = (rest >> 8) & 0xFF;
                } else if (len === 3) {
                    bytes[offset] = (rest >> 16) & 0xFF;
                    bytes[offset + 1] = (rest >> 8) & 0xFF;
                }

                bytes[total - 1] = rest & 0xFF;
            }

            return write(total);
        },
    };
};
