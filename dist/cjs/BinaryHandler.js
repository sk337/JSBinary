"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryHandler = void 0;
class BinaryHandler {
    data;
    position;
    constructor(data = new Uint8Array()) {
        if (typeof data === 'string') {
            this.data = new TextEncoder().encode(data);
        }
        else {
            this.data = data;
        }
        this.position = 0;
    }
    read(size = this.data.length - this.position) {
        const chunk = this.data.slice(this.position, this.position + size);
        this.position += size;
        return chunk;
    }
    write(data) {
        let bytesWritten = 0;
        if (typeof data === 'string') {
            data = new TextEncoder().encode(data);
        }
        const newData = new Uint8Array(Math.max(this.data.length, this.position + data.length));
        newData.set(this.data);
        newData.set(data, this.position); // Write at the current position
        this.data = newData;
        bytesWritten = data.length;
        this.position += bytesWritten; // Advance the position
        return bytesWritten;
    }
    seek(offset, whence = 'start') {
        if (whence === 'start') {
            this.position = offset;
        }
        else if (whence === 'current') {
            this.position += offset;
        }
        else if (whence === 'end') {
            this.position = this.data.length + offset;
        }
        this.position = Math.max(0, Math.min(this.position, this.data.length));
    }
    tell() {
        return this.position;
    }
    write7BitEncodedInt(value) {
        while (value >= 0x80) {
            this.write(new Uint8Array([(value & 0x7f) | 0x80]));
            value >>= 7;
        }
        this.write(new Uint8Array([value]));
    }
    read7BitEncodedInt() {
        let value = 0;
        let shift = 0;
        let byte;
        do {
            if (this.position >= this.data.length) {
                throw new Error('Attempted to read beyond the end of the buffer');
            }
            byte = this.data[this.position];
            value |= (byte & 0x7f) << shift;
            shift += 7;
            this.position++;
        } while (byte & 0x80);
        return value;
    }
    readInt8() {
        const view = new DataView(this.read(1).buffer);
        return view.getInt8(0);
    }
    readUint8() {
        const view = new DataView(this.read(1).buffer);
        return view.getUint8(0);
    }
    readInt16(le = true) {
        const view = new DataView(this.read(2).buffer);
        return view.getInt16(0, le);
    }
    readUint16(le = true) {
        const view = new DataView(this.read(2).buffer);
        return view.getUint16(0, le);
    }
    readInt32(le = true) {
        const view = new DataView(this.read(4).buffer);
        return view.getInt32(0, le);
    }
    readUint32(le = true) {
        const view = new DataView(this.read(4).buffer);
        return view.getUint32(0, le);
    }
    readInt64(le = true) {
        const view = new DataView(this.read(8).buffer);
        return view.getBigInt64(0, le);
    }
    readUint64(le = true) {
        const view = new DataView(this.read(8).buffer);
        return view.getBigUint64(0, le);
    }
    toString() {
        if (typeof TextDecoder === 'undefined') {
            let o = '';
            this.data.forEach((v) => {
                o += String.fromCharCode(v);
            });
            return o;
        }
        else {
            return new TextDecoder().decode(this.data);
        }
    }
}
exports.BinaryHandler = BinaryHandler;
