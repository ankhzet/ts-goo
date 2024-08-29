export class CRC8 {
    private readonly initial_value: number;

    constructor(initial_value = 0) {
        this.initial_value = initial_value;
    }

    checksum(bytes: Iterable<number>) {
        let checksum = this.initial_value;

        for (const byte of bytes) {
            checksum = (checksum + byte) & 0xFF;
        }

        return checksum ^ 0xFF;
    }
}
