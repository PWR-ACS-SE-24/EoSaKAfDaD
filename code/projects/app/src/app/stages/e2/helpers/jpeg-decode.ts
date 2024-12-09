/*
    Based on https://github.com/jpeg-js/jpeg-js/blob/master/lib/decoder.js
    We own nothing. This is a simple TypeScript conversion of the original code.
*/

type DecodeFn = (
  component: ComponentT,
  zz: Int32Array,
  spectralStart: number,
  spectralEnd: number,
  successive: number,
) => void;
type LeafOrTree = number | LeafOrTree[];
type HuffmanTableT = { children: LeafOrTree; index: number };

interface ComponentT {
  blocksPerLine: number;
  blocksPerColumn: number;
  quantizationTable: any;
  blocks: Int32Array[][];
  huffmanTableDC: LeafOrTree;
  huffmanTableAC: LeafOrTree;
  pred: number;
  v: number;
  h: number;
  quantizationIdx: number;
  lines: Uint8Array[];
  scaleX: number;
  scaleY: number;
}
interface FrameT {
  components: ComponentT[];
  samplesPerLine: number;
  scanLines: number;
  maxH: number;
  maxV: number;
  mcusPerLine: number;
  mcusPerColumn: number;
  extended: boolean;
  progressive: boolean;
  precision: number;
  componentsOrder: number[];
}
interface Opts {
  tolerantDecoding: boolean;
}

const DCT_ZIG_ZAG = new Int32Array([
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40,
  48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29,
  22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54,
  47, 55, 62, 63,
]);

const DCTCOS1 = 4017; // cos(pi/16)
const DCTSIN1 = 799; // sin(pi/16)
const DCTCOS3 = 3406; // cos(3*pi/16)
const DCTSIN3 = 2276; // sin(3*pi/16)
const DCTCOS6 = 1567; // cos(6*pi/16)
const DCTSIN6 = 3784; // sin(6*pi/16)
const DCTSQRT2 = 5793; // sqrt(2)
const DCTSQRT1D2 = 2896; // sqrt(2) / 2

export class JPEGDecoder {
  protected offset: number = 0;
  protected bitsData: number = 0;
  protected bitsCount: number = 0;
  protected successiveACState = 0;
  protected successiveACNextValue = 0;
  protected eobrun = 0;
  protected comments: string[] = new Array();
  protected exifBuffer: Uint8ClampedArray = new Uint8ClampedArray(0);
  protected components: ComponentT[] = new Array();
  protected secretData: number[][] = new Array();
  protected opts: Opts;

  public getDCTEmbeddedData(embedLength: number): Uint8ClampedArray {
    return Uint8ClampedArray.from(
      this.secretData
        .flatMap((block) => block.slice(0, embedLength))
        .flatMap((pixel) => (pixel & 0b10) >> 1),
    );
  }

  constructor(
    protected data: Uint8ClampedArray,
    userOpts: Partial<Opts> = {},
  ) {
    let defaultOpts: Opts = { tolerantDecoding: true };
    this.opts = { ...defaultOpts, ...userOpts };
  }

  private buildHuffmanTable(
    codeLengths: Uint8Array,
    values: Uint8Array,
  ): LeafOrTree {
    let k = 0,
      length = 16;
    let code: HuffmanTableT[] = [];

    while (length > 0 && !codeLengths[length - 1]) length--;

    code.push({ children: new Array(), index: 0 });

    let p = code[0],
      q: HuffmanTableT;
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < codeLengths[i]; j++) {
        p = code.pop()!; // FIXME: ! added
        // To make tslint happy
        (p.children as [number, number])[p.index] = values[k];
        while (p.index > 0) {
          if (code.length === 0)
            throw new Error("Could not recreate Huffman Table");
          p = code.pop()!;
        }
        p.index++;
        code.push(p);

        while (code.length <= i) {
          q = { children: new Array(), index: 0 };
          code.push(q);
          // To make tslint happy
          (p.children as LeafOrTree[])[p.index] = q.children;
          p = q;
        }
        k++;
      }
      if (i + 1 < length) {
        q = { children: new Array(), index: 0 };
        code.push(q);
        // p here points to last code
        (p.children as LeafOrTree[])[p.index] = q.children;
        p = q;
      }
    }
    // tslint please stop complaining
    return code[0].children;
  }

  private _readBit() {
    if (this.bitsCount > 0) {
      this.bitsCount--;
      return (this.bitsData >> this.bitsCount) & 1;
    }
    this.bitsData = this.data[this.offset++];
    if (this.bitsData == 0xff) {
      var nextByte = this.data[this.offset++];
      if (nextByte) {
        throw new Error(
          "unexpected marker: " +
            ((this.bitsData << 8) | nextByte).toString(16),
        );
      }
      // unstuff 0
    }
    this.bitsCount = 7;
    return this.bitsData >>> 7;
  }

  private readBit() {
    let bit = this._readBit();
    return bit;
  }

  private readUint16() {
    var value = (this.data[this.offset] << 8) | this.data[this.offset + 1];
    this.offset += 2;
    return value;
  }

  private readDataBlock() {
    var length = this.readUint16();
    var array = this.data.subarray(this.offset, this.offset + length - 2);
    this.offset += array.length;
    return array;
  }

  private decodeHuffman(tree: LeafOrTree): number {
    let node = tree;
    let bit = 0;

    while ((bit = this.readBit()) !== null) {
      // To make tslint happy, will probably never be reached
      if (typeof node === "number")
        throw new Error("pre-invalid huffman sequence");

      node = node[bit] as LeafOrTree[];
      if (typeof node === "number") return node;
      if (typeof node !== "object") throw new Error("invalid huffman sequence");
    }
    throw new Error("invalid huffman sequence");
  }

  private receive(length: number) {
    let n = 0;
    while (length > 0) {
      let bit = this.readBit();
      n = (n << 1) | bit;
      length--;
    }
    return n;
  }

  private receiveAndExtend(length: number) {
    var n = this.receive(length);
    if (n >= 1 << (length - 1)) return n;
    return n + (-1 << length) + 1;
  }

  private decodeBaseline(
    component: ComponentT,
    zz: Int32Array,
    spectralStart: number,
    spectralEnd: number,
    successive: number,
  ) {
    let block = [];
    let t = this.decodeHuffman(component.huffmanTableDC);
    let diff = t === 0 ? 0 : this.receiveAndExtend(t);
    zz[0] = component.pred += diff;
    let k = 1;
    while (k < 64) {
      let rs = this.decodeHuffman(component.huffmanTableAC);
      let s = rs & 15,
        r = rs >> 4;
      if (s === 0) {
        if (r < 15) break;
        k += 16;
        continue;
      }
      k += r;
      let z = DCT_ZIG_ZAG[k];
      zz[z] = this.receiveAndExtend(s);
      block.push(zz[z]);
      k++;
    }
    this.secretData.push(block);
  }

  private decodeDCFirst(
    component: ComponentT,
    zz: Int32Array,
    spectralStart: number,
    spectralEnd: number,
    successive: number,
  ) {
    var t = this.decodeHuffman(component.huffmanTableDC);
    var diff = t === 0 ? 0 : this.receiveAndExtend(t) << successive;
    zz[0] = component.pred += diff;
  }

  private decodeDCSuccessive(
    component: ComponentT,
    zz: Int32Array,
    spectralStart: number,
    spectralEnd: number,
    successive: number,
  ) {
    zz[0] |= this.readBit() << successive;
  }

  private decodeACFirst(
    component: ComponentT,
    zz: Int32Array,
    spectralStart: number,
    spectralEnd: number,
    successive: number,
  ) {
    if (this.eobrun > 0) {
      this.eobrun--;
    }
    var k = spectralStart,
      e = spectralEnd;
    while (k <= e) {
      var rs = this.decodeHuffman(component.huffmanTableAC);
      var s = rs & 15,
        r = rs >> 4;
      if (s === 0) {
        if (r < 15) {
          this.eobrun = this.receive(r) + (1 << r) - 1;
          break;
        }
        k += 16;
        continue;
      }
      k += r;
      var z = DCT_ZIG_ZAG[k];
      zz[z] = this.receiveAndExtend(s) * (1 << successive);
      k++;
    }
  }

  private decodeACSuccessive(
    component: ComponentT,
    zz: Int32Array,
    spectralStart: number,
    spectralEnd: number,
    successive: number,
  ) {
    var k = spectralStart,
      e = spectralEnd,
      r = 0;
    while (k <= e) {
      var z = DCT_ZIG_ZAG[k];
      var direction = zz[z] < 0 ? -1 : 1;
      switch (this.successiveACState) {
        case 0: // initial state
          var rs = this.decodeHuffman(component.huffmanTableAC);
          var s = rs & 15,
            r = rs >> 4;
          if (s === 0) {
            if (r < 15) {
              this.eobrun = this.receive(r) + (1 << r);
              this.successiveACState = 4;
            } else {
              r = 16;
              this.successiveACState = 1;
            }
          } else {
            if (s !== 1) throw new Error("invalid ACn encoding");
            this.successiveACNextValue = this.receiveAndExtend(s);
            this.successiveACState = r ? 2 : 3;
          }
          continue;
        case 1: // skipping r zero items
        case 2:
          if (zz[z]) zz[z] += (this.readBit() << successive) * direction;
          else {
            r--;
            if (r === 0)
              this.successiveACState = this.successiveACState == 2 ? 3 : 0;
          }
          break;
        case 3: // set value for a zero item
          if (zz[z]) zz[z] += (this.readBit() << successive) * direction;
          else {
            zz[z] = this.successiveACNextValue << successive;
            this.successiveACState = 0;
          }
          break;
        case 4: // eob
          if (zz[z]) zz[z] += (this.readBit() << successive) * direction;
          break;
      }
      k++;
    }
    if (this.successiveACState === 4) {
      this.eobrun--;
      if (this.eobrun === 0) this.successiveACState = 0;
    }
  }

  private decodeMcu(
    mcusPerLine: number,
    component: ComponentT,
    decode: DecodeFn,
    mcu: number,
    row: number,
    col: number,
    spectralStart: number,
    spectralEnd: number,
    successive: number,
  ) {
    let mcuRow = (mcu / mcusPerLine) | 0;
    let mcuCol = mcu % mcusPerLine;
    let blockRow = mcuRow * component.v + row;
    let blockCol = mcuCol * component.h + col;
    // If the block is missing and we're in tolerant mode, just skip it.
    if (component.blocks[blockRow] === undefined && this.opts.tolerantDecoding)
      return;
    decode(
      component,
      component.blocks[blockRow][blockCol],
      spectralStart,
      spectralEnd,
      successive,
    );
  }

  private decodeBlock(
    component: ComponentT,
    decode: DecodeFn,
    mcu: number,
    spectralStart: number,
    spectralEnd: number,
    successive: number,
  ) {
    var blockRow = (mcu / component.blocksPerLine) | 0;
    var blockCol = mcu % component.blocksPerLine;
    // If the block is missing and we're in tolerant mode, just skip it.
    if (component.blocks[blockRow] === undefined && this.opts.tolerantDecoding)
      return;
    decode(
      component,
      component.blocks[blockRow][blockCol],
      spectralStart,
      spectralEnd,
      successive,
    );
  }

  private decodeScan(
    frame: { mcusPerLine: number; mcusPerColumn: number; progressive: boolean },
    components: ComponentT[],
    resetInterval: number,
    spectralStart: number,
    spectralEnd: number,
    successivePrev: number,
    successive: number,
  ) {
    let mcusPerLine = frame.mcusPerLine;
    let progressive = frame.progressive;

    let componentsLength = components.length;
    let component, i, j, k, n;
    let decodeFn;
    if (progressive) {
      if (spectralStart === 0)
        decodeFn =
          successivePrev === 0 ? this.decodeDCFirst : this.decodeDCSuccessive;
      else
        decodeFn =
          successivePrev === 0 ? this.decodeACFirst : this.decodeACSuccessive;
    } else {
      decodeFn = this.decodeBaseline;
    }

    decodeFn = decodeFn.bind(this);

    let mcu = 0,
      marker;
    let mcuExpected;
    if (componentsLength == 1) {
      mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
    } else {
      mcuExpected = mcusPerLine * frame.mcusPerColumn;
    }
    if (!resetInterval) resetInterval = mcuExpected;

    let h, v;
    while (mcu < mcuExpected) {
      // reset interval stuff
      for (i = 0; i < componentsLength; i++) components[i].pred = 0;
      this.eobrun = 0;

      if (componentsLength == 1) {
        component = components[0];
        for (n = 0; n < resetInterval; n++) {
          this.decodeBlock(
            component,
            decodeFn,
            mcu,
            spectralStart,
            spectralEnd,
            successive,
          );
          mcu++;
        }
      } else {
        for (n = 0; n < resetInterval; n++) {
          for (i = 0; i < componentsLength; i++) {
            component = components[i];
            h = component.h;
            v = component.v;
            for (j = 0; j < v; j++) {
              for (k = 0; k < h; k++) {
                this.decodeMcu(
                  mcusPerLine,
                  component,
                  decodeFn,
                  mcu,
                  j,
                  k,
                  spectralStart,
                  spectralEnd,
                  successive,
                );
              }
            }
          }
          mcu++;

          // If we've reached our expected MCU's, stop decoding
          if (mcu === mcuExpected) break;
        }
      }

      if (mcu === mcuExpected) {
        // Skip trailing bytes at the end of the scan - until we reach the next marker
        do {
          if (this.data[this.offset] === 0xff) {
            if (this.data[this.offset + 1] !== 0x00) {
              break;
            }
          }
          this.offset += 1;
        } while (this.offset < this.data.length - 2);
      }

      // find marker
      this.bitsCount = 0;
      marker = (this.data[this.offset] << 8) | this.data[this.offset + 1];
      if (marker < 0xff00) {
        throw new Error("marker was not found");
      }

      if (marker >= 0xffd0 && marker <= 0xffd7) {
        // RSTx
        this.offset += 2;
      } else break;
    }
  }

  private quantizeAndInverse(
    zz: Int32Array,
    dataOut: Uint8Array,
    dataIn: Int32Array,
    component: ComponentT,
  ) {
    var qt = component.quantizationTable;
    var v0, v1, v2, v3, v4, v5, v6, v7, t;
    var p = dataIn;
    var i;

    // dequant
    for (i = 0; i < 64; i++) p[i] = zz[i] * qt[i];

    // inverse DCT on rows
    for (i = 0; i < 8; ++i) {
      var row = 8 * i;

      // check for all-zero AC coefficients
      if (
        p[1 + row] == 0 &&
        p[2 + row] == 0 &&
        p[3 + row] == 0 &&
        p[4 + row] == 0 &&
        p[5 + row] == 0 &&
        p[6 + row] == 0 &&
        p[7 + row] == 0
      ) {
        t = (DCTSQRT2 * p[0 + row] + 512) >> 10;
        p[0 + row] = t;
        p[1 + row] = t;
        p[2 + row] = t;
        p[3 + row] = t;
        p[4 + row] = t;
        p[5 + row] = t;
        p[6 + row] = t;
        p[7 + row] = t;
        continue;
      }

      // stage 4
      v0 = (DCTSQRT2 * p[0 + row] + 128) >> 8;
      v1 = (DCTSQRT2 * p[4 + row] + 128) >> 8;
      v2 = p[2 + row];
      v3 = p[6 + row];
      v4 = (DCTSQRT1D2 * (p[1 + row] - p[7 + row]) + 128) >> 8;
      v7 = (DCTSQRT1D2 * (p[1 + row] + p[7 + row]) + 128) >> 8;
      v5 = p[3 + row] << 4;
      v6 = p[5 + row] << 4;

      // stage 3
      t = (v0 - v1 + 1) >> 1;
      v0 = (v0 + v1 + 1) >> 1;
      v1 = t;
      t = (v2 * DCTSIN6 + v3 * DCTCOS6 + 128) >> 8;
      v2 = (v2 * DCTCOS6 - v3 * DCTSIN6 + 128) >> 8;
      v3 = t;
      t = (v4 - v6 + 1) >> 1;
      v4 = (v4 + v6 + 1) >> 1;
      v6 = t;
      t = (v7 + v5 + 1) >> 1;
      v5 = (v7 - v5 + 1) >> 1;
      v7 = t;

      // stage 2
      t = (v0 - v3 + 1) >> 1;
      v0 = (v0 + v3 + 1) >> 1;
      v3 = t;
      t = (v1 - v2 + 1) >> 1;
      v1 = (v1 + v2 + 1) >> 1;
      v2 = t;
      t = (v4 * DCTSIN3 + v7 * DCTCOS3 + 2048) >> 12;
      v4 = (v4 * DCTCOS3 - v7 * DCTSIN3 + 2048) >> 12;
      v7 = t;
      t = (v5 * DCTSIN1 + v6 * DCTCOS1 + 2048) >> 12;
      v5 = (v5 * DCTCOS1 - v6 * DCTSIN1 + 2048) >> 12;
      v6 = t;

      // stage 1
      p[0 + row] = v0 + v7;
      p[7 + row] = v0 - v7;
      p[1 + row] = v1 + v6;
      p[6 + row] = v1 - v6;
      p[2 + row] = v2 + v5;
      p[5 + row] = v2 - v5;
      p[3 + row] = v3 + v4;
      p[4 + row] = v3 - v4;
    }

    // inverse DCT on columns
    for (i = 0; i < 8; ++i) {
      var col = i;

      // check for all-zero AC coefficients
      if (
        p[1 * 8 + col] == 0 &&
        p[2 * 8 + col] == 0 &&
        p[3 * 8 + col] == 0 &&
        p[4 * 8 + col] == 0 &&
        p[5 * 8 + col] == 0 &&
        p[6 * 8 + col] == 0 &&
        p[7 * 8 + col] == 0
      ) {
        t = (DCTSQRT2 * dataIn[i + 0] + 8192) >> 14;
        p[0 * 8 + col] = t;
        p[1 * 8 + col] = t;
        p[2 * 8 + col] = t;
        p[3 * 8 + col] = t;
        p[4 * 8 + col] = t;
        p[5 * 8 + col] = t;
        p[6 * 8 + col] = t;
        p[7 * 8 + col] = t;
        continue;
      }

      // stage 4
      v0 = (DCTSQRT2 * p[0 * 8 + col] + 2048) >> 12;
      v1 = (DCTSQRT2 * p[4 * 8 + col] + 2048) >> 12;
      v2 = p[2 * 8 + col];
      v3 = p[6 * 8 + col];
      v4 = (DCTSQRT1D2 * (p[1 * 8 + col] - p[7 * 8 + col]) + 2048) >> 12;
      v7 = (DCTSQRT1D2 * (p[1 * 8 + col] + p[7 * 8 + col]) + 2048) >> 12;
      v5 = p[3 * 8 + col];
      v6 = p[5 * 8 + col];

      // stage 3
      t = (v0 - v1 + 1) >> 1;
      v0 = (v0 + v1 + 1) >> 1;
      v1 = t;
      t = (v2 * DCTSIN6 + v3 * DCTCOS6 + 2048) >> 12;
      v2 = (v2 * DCTCOS6 - v3 * DCTSIN6 + 2048) >> 12;
      v3 = t;
      t = (v4 - v6 + 1) >> 1;
      v4 = (v4 + v6 + 1) >> 1;
      v6 = t;
      t = (v7 + v5 + 1) >> 1;
      v5 = (v7 - v5 + 1) >> 1;
      v7 = t;

      // stage 2
      t = (v0 - v3 + 1) >> 1;
      v0 = (v0 + v3 + 1) >> 1;
      v3 = t;
      t = (v1 - v2 + 1) >> 1;
      v1 = (v1 + v2 + 1) >> 1;
      v2 = t;
      t = (v4 * DCTSIN3 + v7 * DCTCOS3 + 2048) >> 12;
      v4 = (v4 * DCTCOS3 - v7 * DCTSIN3 + 2048) >> 12;
      v7 = t;
      t = (v5 * DCTSIN1 + v6 * DCTCOS1 + 2048) >> 12;
      v5 = (v5 * DCTCOS1 - v6 * DCTSIN1 + 2048) >> 12;
      v6 = t;

      // stage 1
      p[0 * 8 + col] = v0 + v7;
      p[7 * 8 + col] = v0 - v7;
      p[1 * 8 + col] = v1 + v6;
      p[6 * 8 + col] = v1 - v6;
      p[2 * 8 + col] = v2 + v5;
      p[5 * 8 + col] = v2 - v5;
      p[3 * 8 + col] = v3 + v4;
      p[4 * 8 + col] = v3 - v4;
    }

    // convert to 8-bit integers
    for (i = 0; i < 64; ++i) {
      var sample = 128 + ((p[i] + 8) >> 4);
      dataOut[i] = sample < 0 ? 0 : sample > 0xff ? 0xff : sample;
    }
  }

  private buildComponentData(component: ComponentT) {
    var lines = [];
    var blocksPerLine = component.blocksPerLine;
    var blocksPerColumn = component.blocksPerColumn;
    var samplesPerLine = blocksPerLine << 3;
    // Only 1 used per invocation of this function and garbage collected after invocation, so no need to account for its memory footprint.
    var R = new Int32Array(64),
      r = new Uint8Array(64);

    // A port of poppler's IDCT method which in turn is taken from:
    //   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
    //   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
    //   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
    //   988-991.

    var i, j;
    for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
      var scanLine = blockRow << 3;
      for (i = 0; i < 8; i++) lines.push(new Uint8Array(samplesPerLine));
      for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
        this.quantizeAndInverse(
          component.blocks[blockRow][blockCol],
          r,
          R,
          component,
        );

        var offset = 0,
          sample = blockCol << 3;
        for (j = 0; j < 8; j++) {
          var line = lines[scanLine + j];
          for (i = 0; i < 8; i++) line[sample + i] = r[offset++];
        }
      }
    }
    return lines;
  }

  private clampTo8bit(a: number) {
    return a < 0 ? 0 : a > 255 ? 255 : a;
  }

  private prepareComponents(frame: FrameT) {
    // According to the JPEG standard, the sampling factor must be between 1 and 4
    // See https://github.com/libjpeg-turbo/libjpeg-turbo/blob/9abeff46d87bd201a952e276f3e4339556a403a3/libjpeg.txt#L1138-L1146
    let maxH = 1,
      maxV = 1;
    let component, componentId;
    for (componentId in frame.components) {
      if (frame.components.hasOwnProperty(componentId)) {
        component = frame.components[componentId];
        if (maxH < component.h) maxH = component.h;
        if (maxV < component.v) maxV = component.v;
      }
    }
    let mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / maxH);
    let mcusPerColumn = Math.ceil(frame.scanLines / 8 / maxV);
    for (componentId in frame.components) {
      if (frame.components.hasOwnProperty(componentId)) {
        component = frame.components[componentId];
        let blocksPerLine = Math.ceil(
          (Math.ceil(frame.samplesPerLine / 8) * component.h) / maxH,
        );
        let blocksPerColumn = Math.ceil(
          (Math.ceil(frame.scanLines / 8) * component.v) / maxV,
        );
        let blocksPerLineForMcu = mcusPerLine * component.h;
        let blocksPerColumnForMcu = mcusPerColumn * component.v;
        let blocks = [];

        for (let i = 0; i < blocksPerColumnForMcu; i++) {
          let row = [];
          for (let j = 0; j < blocksPerLineForMcu; j++)
            row.push(new Int32Array(64));
          blocks.push(row);
        }
        component.blocksPerLine = blocksPerLine;
        component.blocksPerColumn = blocksPerColumn;
        component.blocks = blocks;
      }
    }
    frame.maxH = maxH;
    frame.maxV = maxV;
    frame.mcusPerLine = mcusPerLine;
    frame.mcusPerColumn = mcusPerColumn;
  }

  public parse() {
    this.secretData = new Array();
    this.offset = 0;

    let jfif = null;
    let adobe = null;
    let frame, resetInterval;
    let quantizationTables = [],
      frames = [];
    let huffmanTablesAC: LeafOrTree = new Array();
    let huffmanTablesDC: LeafOrTree = new Array();
    let fileMarker = this.readUint16();
    let malformedDataOffset = -1;
    this.comments = [];
    if (fileMarker != 0xffd8) {
      // SOI (Start of Image)
      throw new Error("SOI not found");
    }

    fileMarker = this.readUint16();
    while (fileMarker != 0xffd9) {
      // EOI (End of image)
      var i, j;
      switch (fileMarker) {
        case 0xff00:
          break;
        case 0xffe0: // APP0 (Application Specific)
        case 0xffe1: // APP1
        case 0xffe2: // APP2
        case 0xffe3: // APP3
        case 0xffe4: // APP4
        case 0xffe5: // APP5
        case 0xffe6: // APP6
        case 0xffe7: // APP7
        case 0xffe8: // APP8
        case 0xffe9: // APP9
        case 0xffea: // APP10
        case 0xffeb: // APP11
        case 0xffec: // APP12
        case 0xffed: // APP13
        case 0xffee: // APP14
        case 0xffef: // APP15
        case 0xfffe: // COM (Comment)
          let appData = this.readDataBlock();

          if (fileMarker === 0xfffe) {
            let comment = String.fromCharCode.apply(null, Array.from(appData));
            this.comments.push(comment);
          }

          if (fileMarker === 0xffe0) {
            if (
              appData[0] === 0x4a &&
              appData[1] === 0x46 &&
              appData[2] === 0x49 &&
              appData[3] === 0x46 &&
              appData[4] === 0
            ) {
              // 'JFIF\x00'
              jfif = {
                version: { major: appData[5], minor: appData[6] },
                densityUnits: appData[7],
                xDensity: (appData[8] << 8) | appData[9],
                yDensity: (appData[10] << 8) | appData[11],
                thumbWidth: appData[12],
                thumbHeight: appData[13],
                thumbData: appData.subarray(
                  14,
                  14 + 3 * appData[12] * appData[13],
                ),
              };
            }
          }
          // TODO APP1 - Exif
          if (fileMarker === 0xffe1) {
            if (
              appData[0] === 0x45 &&
              appData[1] === 0x78 &&
              appData[2] === 0x69 &&
              appData[3] === 0x66 &&
              appData[4] === 0
            ) {
              // 'EXIF\x00'
              this.exifBuffer = appData.subarray(5, appData.length);
            }
          }

          if (fileMarker === 0xffee) {
            if (
              appData[0] === 0x41 &&
              appData[1] === 0x64 &&
              appData[2] === 0x6f &&
              appData[3] === 0x62 &&
              appData[4] === 0x65 &&
              appData[5] === 0
            ) {
              // 'Adobe\x00'
              adobe = {
                version: appData[6],
                flags0: (appData[7] << 8) | appData[8],
                flags1: (appData[9] << 8) | appData[10],
                transformCode: appData[11],
              };
            }
          }
          break;

        case 0xffdb: // DQT (Define Quantization Tables)
          let quantizationTablesLength = this.readUint16();
          let quantizationTablesEnd =
            quantizationTablesLength + this.offset - 2;
          while (this.offset < quantizationTablesEnd) {
            let quantizationTableSpec = this.data[this.offset++];
            let tableData = new Int32Array(64);
            if (quantizationTableSpec >> 4 === 0) {
              // 8 bit values
              for (j = 0; j < 64; j++) {
                let z = DCT_ZIG_ZAG[j];
                tableData[z] = this.data[this.offset++];
              }
            } else if (quantizationTableSpec >> 4 === 1) {
              //16 bit
              for (j = 0; j < 64; j++) {
                let z = DCT_ZIG_ZAG[j];
                tableData[z] = this.readUint16();
              }
            } else throw new Error("DQT: invalid table spec");
            quantizationTables[quantizationTableSpec & 15] = tableData;
          }
          break;

        case 0xffc0: // SOF0 (Start of Frame, Baseline DCT)
        case 0xffc1: // SOF1 (Start of Frame, Extended DCT)
        case 0xffc2: // SOF2 (Start of Frame, Progressive DCT)
          this.readUint16(); // skip data length
          frame = {} as FrameT;
          frame.extended = fileMarker === 0xffc1;
          frame.progressive = fileMarker === 0xffc2;
          frame.precision = this.data[this.offset++];
          frame.scanLines = this.readUint16();
          frame.samplesPerLine = this.readUint16();
          frame.components = new Array();
          frame.componentsOrder = [];

          let componentsCount = this.data[this.offset++],
            componentId;
          for (i = 0; i < componentsCount; i++) {
            componentId = this.data[this.offset];
            let h = this.data[this.offset + 1] >> 4;
            let v = this.data[this.offset + 1] & 15;
            let qId = this.data[this.offset + 2];

            if (h <= 0 || v <= 0) {
              throw new Error(
                "Invalid sampling factor, expected values above 0",
              );
            }

            frame.componentsOrder.push(componentId);
            frame.components[componentId] = {
              blocks: [],
              blocksPerColumn: 0,
              blocksPerLine: 0,
              huffmanTableAC: [],
              huffmanTableDC: [],
              pred: 0,
              quantizationTable: [],
              scaleX: 0,
              scaleY: 0,
              lines: [],
              h: h,
              v: v,
              quantizationIdx: qId,
            };
            this.offset += 3;
          }
          this.prepareComponents(frame);
          frames.push(frame);
          break;

        case 0xffc4: // DHT (Define Huffman Tables)
          let huffmanLength = this.readUint16();
          for (i = 2; i < huffmanLength; ) {
            let huffmanTableSpec = this.data[this.offset++];
            let codeLengths = new Uint8Array(16);
            let codeLengthSum = 0;
            for (j = 0; j < 16; j++, this.offset++) {
              codeLengthSum += codeLengths[j] = this.data[this.offset];
            }
            let huffmanValues = new Uint8Array(codeLengthSum);
            for (j = 0; j < codeLengthSum; j++, this.offset++)
              huffmanValues[j] = this.data[this.offset];
            i += 17 + codeLengthSum;

            (huffmanTableSpec >> 4 === 0 ? huffmanTablesDC : huffmanTablesAC)[
              huffmanTableSpec & 15
            ] = this.buildHuffmanTable(codeLengths, huffmanValues);
          }
          break;

        case 0xffdd: // DRI (Define Restart Interval)
          this.readUint16(); // skip data length
          resetInterval = this.readUint16();
          break;

        case 0xffdc: // Number of Lines marker
          this.readUint16(); // skip data length
          this.readUint16(); // Ignore this data since it represents the image height
          break;

        case 0xffda: // SOS (Start of Scan)
          let scanLength = this.readUint16();
          let selectorsCount = this.data[this.offset++];
          let components: ComponentT[] = [];
          for (i = 0; i < selectorsCount; i++) {
            let component = frame!.components[this.data[this.offset++]];
            let tableSpec = this.data[this.offset++];
            component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
            component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
            components.push(component);
          }
          let spectralStart = this.data[this.offset++];
          let spectralEnd = this.data[this.offset++];
          let successiveApproximation = this.data[this.offset++];
          this.decodeScan(
            frame!,
            components,
            resetInterval!,
            spectralStart,
            spectralEnd,
            successiveApproximation >> 4,
            successiveApproximation & 15,
          );
          break;

        case 0xffff: // Fill bytes
          if (this.data[this.offset] !== 0xff) {
            // Avoid skipping a valid marker.
            this.offset--;
          }
          break;
        default:
          if (
            this.data[this.offset - 3] == 0xff &&
            this.data[this.offset - 2] >= 0xc0 &&
            this.data[this.offset - 2] <= 0xfe
          ) {
            // could be incorrect encoding -- last 0xFF byte of the previous
            // block was eaten by the encoder
            this.offset -= 3;
            break;
          } else if (fileMarker === 0xe0 || fileMarker == 0xe1) {
            // Recover from malformed APP1 markers popular in some phone models.
            // See https://github.com/eugeneware/jpeg-js/issues/82
            if (malformedDataOffset !== -1) {
              throw new Error(
                `first unknown JPEG marker at offset ${malformedDataOffset.toString(16)}, second unknown JPEG marker ${fileMarker.toString(16)} at offset ${(this.offset - 1).toString(16)}`,
              );
            }
            malformedDataOffset = this.offset - 1;
            const nextOffset = this.readUint16();
            if (this.data[this.offset + nextOffset - 2] === 0xff) {
              this.offset += nextOffset - 2;
              break;
            }
          }
          throw new Error("unknown JPEG marker " + fileMarker.toString(16));
      }
      fileMarker = this.readUint16();
    }
    if (frames.length != 1)
      throw new Error("only single frame JPEGs supported");

    // set each frame's components quantization table
    for (let i = 0; i < frames.length; i++) {
      let cp = frames[i].components;
      for (let j in cp) {
        cp[j].quantizationTable = quantizationTables[cp[j].quantizationIdx];
      }
    }
  }
}
