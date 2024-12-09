import { Injectable } from "@angular/core";
import { Buffer } from "buffer";
import * as crc32 from "crc-32";

@Injectable({
  providedIn: "root",
})
export class PngMetaService {
  private readonly KEY_PREFIX = "SecretText";
  private readonly CHUNK_TYPE = Buffer.from("tEXt", "ascii");
  private readonly CHUNK_TYPE_LENGTH = 4;
  private readonly CHUNK_LENGTH_LENGTH = 4;
  private readonly CHUNK_CRC_LENGTH = 4;
  private readonly IEND_LENGTH = 12;

  private createKey = (key: string) => `${this.KEY_PREFIX}${key}`;

  constructor() {}

  public async encode(
    inputPng: File,
    key: string,
    text: string,
  ): Promise<File> {
    const keyWithPrefix = this.createKey(key);
    const inputBuffer = await inputPng.arrayBuffer().then((arrayBuffer) => {
      return Buffer.from(arrayBuffer);
    });

    const chunkData = Buffer.from(`${keyWithPrefix}\0${text}`);

    const chunkLength = Buffer.alloc(this.CHUNK_LENGTH_LENGTH);
    chunkLength.writeUInt32BE(chunkData.length, 0);

    const chunk = Buffer.concat([this.CHUNK_TYPE, chunkData]);
    const chunkCrc = Buffer.alloc(this.CHUNK_CRC_LENGTH);
    chunkCrc.writeInt32BE(crc32.buf(chunk), 0);

    const fullChunk = Buffer.concat([chunkLength, chunk, chunkCrc]);
    const outputBuffer = Buffer.concat([
      Buffer.from(
        inputBuffer.subarray(0, inputBuffer.length - this.IEND_LENGTH),
      ),
      fullChunk,
      Buffer.from(inputBuffer.subarray(inputBuffer.length - this.IEND_LENGTH)),
    ]);

    return new File([outputBuffer], inputPng.name, { type: inputPng.type });
  }

  public decode() {}
}
