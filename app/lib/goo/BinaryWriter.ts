export class BinaryWriter {
    private readonly chunk: number;
    private buffer: Buffer;
    private position: number;

    public constructor(chunk: number) {
        this.chunk = chunk;
        this.position = 0;
        this.buffer = Buffer.alloc(chunk);
    }

    protected get space(): number {
        return this.chunk - this.position;
    }

    public* flush() {
        if (!this.position) {
            return;
        }

        yield this.buffer.subarray(0, this.position);
        this.position = 0;
        this.buffer = Buffer.alloc(this.chunk);
    }

    public* binary(data: Uint8Array) {
        const buf = Buffer.from(data);
        let rest = buf.length;
        let offset = 0;

        while (rest > 0) {
            const amount = Math.min(this.chunk - this.position, rest);
            buf.copy(this.buffer, this.position, offset, amount);
            this.position += amount;
            offset += amount;
            rest -= amount;

            if (this.chunk - this.position <= 0) {
                yield* this.flush();
            }
        }
    }

    public* bool(value: boolean) {
        if (this.space < 1) {
            yield* this.flush();
        }

        this.buffer.writeUint8(+value, this.position);
        this.position += 1;
    }

    public* u8(value: number) {
        if (this.space < 1) {
            yield* this.flush();
        }

        this.buffer.writeUint8(value & 0xFF, this.position);
        this.position += 1;
    }

    public* u16(value: number) {
        if (this.space < 2) {
            yield* this.flush();
        }

        this.buffer.writeUint16BE(value & 0xFFFF, this.position);
        this.position += 2;
    }

    public* u24(value: number) {
        if (this.space < 3) {
            yield* this.flush();
        }

        this.buffer.writeUInt16BE((value >> 8) & 0xFFFF, this.position);
        this.buffer.writeUInt8(value & 0xFF, this.position + 2);
        this.position += 3;
    }

    public* u32(value: number) {
        if (this.space < 4) {
            yield* this.flush();
        }

        this.buffer.writeUInt32BE(value & 0xFFFFFFFF, this.position);
        this.position += 4;
    }

    public* f32(value: number) {
        if (this.space < 4) {
            yield* this.flush();
        }

        this.buffer.writeFloatBE(value, this.position);
        this.position += 4;
    }

    public* string(data: string, length: number) {
        yield * this.flush();
        yield Buffer.alloc(length, data.padEnd(length, '\u0000'));
    }
}
