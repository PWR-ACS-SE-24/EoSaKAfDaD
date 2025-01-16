import { Injectable } from "@angular/core";
import { Buffer } from "buffer";

@Injectable({
  providedIn: "root",
})
export class JpgMetaService {
  private readonly SEGMENT_START = 0xff;
  private readonly JPG_HEADER_END = 0xda;
  private readonly APP1_MARKER_END = 0xe1;
  private readonly SEGMENT_SIZE_OFFSET = 2;
  private readonly SEGMENT_CONTENT_OFFSET = 4;

  private bufferFromFile = async (file: File) =>
    Buffer.from(await file.arrayBuffer());

  public async encode(inputJpg: File, text: string): Promise<File> {
    const inputBuffer = await this.bufferFromFile(inputJpg);

    const headerStartIndex = inputBuffer.indexOf(
      Buffer.from([this.SEGMENT_START, this.JPG_HEADER_END]),
    );

    if (headerStartIndex === -1)
      return new File([inputBuffer], inputJpg.name, { type: inputJpg.type });

    const app1Marker = Buffer.from([this.SEGMENT_START, this.APP1_MARKER_END]);
    const textBuffer = Buffer.from(text, "utf8");
    const sizeBuffer = Buffer.alloc(2);
    sizeBuffer.writeUInt16BE(textBuffer.length + app1Marker.length, 0);

    const newMetadata = Buffer.concat([app1Marker, sizeBuffer, textBuffer]);
    const outputBuffer = Buffer.concat([
      Buffer.from(inputBuffer.subarray(0, headerStartIndex)),
      newMetadata,
      Buffer.from(inputBuffer.subarray(headerStartIndex)),
    ]);

    return new File([outputBuffer], inputJpg.name, { type: inputJpg.type });
  }

  public async decode(inputJpg: File): Promise<string | undefined> {
    const inputBuffer = await this.bufferFromFile(inputJpg);
    const app1SegmentStartIndex = inputBuffer.indexOf(
      Buffer.from([this.SEGMENT_START, this.APP1_MARKER_END]),
    );

    if (app1SegmentStartIndex === -1) return undefined;

    const sizeBuffer = inputBuffer.readUInt16BE(
      app1SegmentStartIndex + this.SEGMENT_SIZE_OFFSET,
    );
    const textBuffer = inputBuffer.subarray(
      app1SegmentStartIndex + this.SEGMENT_CONTENT_OFFSET,
      app1SegmentStartIndex + this.SEGMENT_SIZE_OFFSET + sizeBuffer,
    );
    return textBuffer.toString();
  }
}
