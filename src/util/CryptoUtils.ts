import {Buffer} from "buffer";


export class CryptoUtils {
    static hexToUint8Array(hex: string): Uint8Array {
        return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    }

    static uint8ArrayToHex(arr: Uint8Array): string {
        return Buffer.from(arr).toString("hex");
    }
}