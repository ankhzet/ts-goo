import type { FileHandle } from 'node:fs/promises';
import { assert } from './utils.js';

export class BinaryReader {
    private readable: FileHandle;
    private buffers: Record<number, Buffer> = {};

    public constructor(readable: FileHandle) {
        this.readable = readable;
    }

    protected buffer(size: number) {
        let got = this.buffers[size];

        if (!got) {
            got = Buffer.alloc(size);
            this.buffers[size] = got;
        }

        return got;
    }

    public async assert(data: Uint8Array, message: string) {
        const { buffer, bytesRead } = await this.binary(data.length);
        assert((bytesRead === data.length) && !buffer.compare(data), message);
    }

    public async skip(count: number) {
        return this.readable.read(this.buffer(count), 0, count).then(({ bytesRead }) => bytesRead);
    }

    public async binary(count: number) {
        return this.readable.read(this.buffer(count), 0, count, null);
    }

    public async bool(): Promise<boolean> {
        return this.binary(1).then(({ buffer }) => !!buffer.readUint8());
    }

    public async u8() {
        return this.binary(1).then(({ buffer }) => buffer.readUint8());
    }

    public async u16() {
        return this.binary(2).then(({ buffer }) => buffer.readUint16BE());
    }

    public async u24() {
        return this.binary(3).then(({ buffer }) => {
            const b16 = buffer.readUint16BE();
            const b8 = buffer.readUint8(2);

            return (b16 << 8) | b8;
        });
    }

    public async u32() {
        return this.binary(4).then(({ buffer }) => buffer.readUint32BE());
    }

    public async f32() {
        return this.binary(4).then(({ buffer }) => buffer.readFloatBE());
    }

    public async string(length: number) {
        return this.binary(length).then(({ buffer }) => {
            const terminatorIndex = buffer.indexOf(0);

            return buffer.toString('utf8', 0, terminatorIndex >= 0 ? terminatorIndex : length);
        });
    }

    public async struct<T, Map extends Record<string, () => Promise<any>>>(
        target: T,
        map: Map,
    ): Promise<T & { [N in keyof Map]: Awaited<ReturnType<Map[N]>> }> {
        for (const [key, reader] of Object.entries<() => Promise<any>>(map)) {
            (target as any)[key] = await reader();
        }

        return target as T & { [N in keyof Map]: Awaited<ReturnType<Map[N]>> };
    }
}
