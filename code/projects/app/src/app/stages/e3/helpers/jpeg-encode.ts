/*
    Based on https://github.com/koba04/javascript-jpeg-encoder/blob/master/jpeg_encoder_basic.js
    We own nothing. This is a simple TypeScript conversion of the original code.
*/

const ZIGZAG_PATTERN = [
    0, 1, 5, 6, 14, 15, 27, 28,
    2, 4, 7, 13, 16, 26, 29, 42,
    3, 8, 12, 17, 25, 30, 41, 43,
    9, 11, 18, 24, 31, 40, 44, 53,
    10, 19, 23, 32, 39, 45, 52, 54,
    20, 22, 33, 38, 46, 51, 55, 60,
    21, 34, 37, 47, 50, 56, 59, 61,
    35, 36, 48, 49, 57, 58, 62, 63
];

const STD_DC_LUMINANCE_NRCODE = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const STD_DC_LUMINANCE_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const STD_AC_LUMINANCE_NRCODES = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7D];

const STD_DC_CHROMINANCE_NRCODES = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
const STD_DC_CHROMINANCE_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const STD_AC_CHROMINANCE_NRCODES = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];

const STD_AC_LUMINANCE_VALUES = [
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
    0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0,
    0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
    0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
    0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7,
    0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5,
    0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
    0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
    0xF9, 0xFA
];

const STD_AC_CHROMINANCE_VALUES = [
    0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
    0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91, 0xA1, 0xB1, 0xC1, 0x09, 0x23, 0x33, 0x52, 0xF0,
    0x15, 0x62, 0x72, 0xD1, 0x0A, 0x16, 0x24, 0x34, 0xE1, 0x25, 0xF1, 0x17, 0x18, 0x19, 0x1A, 0x26,
    0x27, 0x28, 0x29, 0x2A, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
    0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
    0x69, 0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
    0x88, 0x89, 0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5,
    0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3,
    0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA,
    0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
    0xF9, 0xFA
];

const YQT = [
    16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55,
    14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99
];

const UVQT = [
    17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99,
    24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99
];

const AASF = [
    1.0, 1.387039845, 1.306562965, 1.175875602,
    1.0, 0.785694958, 0.541196100, 0.275899379
];

export class JPEGEncoder {
    YTable: Array<number> = new Array(64);
    UVTable: Array<number> = new Array(64);

    Y_forward_table: Array<number> = new Array(64);
    UV_forward_table: Array<number> = new Array(64);

    YDC_huffman_table: Array<[number, number]>;
    UVDC_huffman_table: Array<[number, number]>;
    YAC_huffman_table: Array<[number, number]>;
    UVAC_huffman_table: Array<[number, number]>;

    bitcode: Array<[number, number]> = new Array(65535)
    category: Array<number> = new Array(65535);
    
    outputfDCTQuant: Array<number> = new Array(64);
    DU: Array<number> = new Array(64);

    byteout: Array<number> = [];
    bytenew = 0;
    bytepos = 7;

    Y_current_block_values: Array<number> = new Array(64);
    U_current_block_values: Array<number> = new Array(64);
    V_current_block_values: Array<number> = new Array(64);

    quality: number = -1;

    constructor(quality: number) {

        // init huffman tables
        this.YDC_huffman_table = this.computeHuffmanTbl(STD_DC_LUMINANCE_NRCODE, STD_DC_LUMINANCE_VALUES);
        this.UVDC_huffman_table = this.computeHuffmanTbl(STD_DC_CHROMINANCE_NRCODES, STD_DC_CHROMINANCE_VALUES);
        this.YAC_huffman_table = this.computeHuffmanTbl(STD_AC_LUMINANCE_NRCODES, STD_AC_LUMINANCE_VALUES);
        this.UVAC_huffman_table = this.computeHuffmanTbl(STD_AC_CHROMINANCE_NRCODES, STD_AC_CHROMINANCE_VALUES);

        this.initCategoryNumber();
        this.setQuality(quality);
    }

    setQuality(value: number) {
        if (this.quality == value) return // don't recalc if unchanged

        if (value <= 0) {
            this.quality = 1;
        } else if (value > 100) {
            this.quality = 100;
        } else {
            this.quality = value;
        }

        let sf = 0;
        if (this.quality < 50) {
            sf = Math.floor(5000 / this.quality);
        } else {
            sf = Math.floor(200 - this.quality * 2);
        }

        this.initQuantTables(sf);
    }

    private computeHuffmanTbl(nrcodes: Array<number>, std_table: Array<number>) {
        var codevalue = 0;
        var pos_in_table = 0;
        var HT = new Array();
        for (var k = 1; k <= 16; k++) {
            for (var j = 1; j <= nrcodes[k]; j++) {
                HT[std_table[pos_in_table]] = [];
                HT[std_table[pos_in_table]][0] = codevalue;
                HT[std_table[pos_in_table]][1] = k;
                pos_in_table++;
                codevalue++;
            }
            codevalue *= 2;
        }
        return HT;
    }

    private initQuantTables(sf: number) {
        for (let i = 0; i < 64; i++) {
            let t = Math.floor((YQT[i] * sf + 50) / 100);
            if (t < 1) {
                t = 1;
            } else if (t > 255) {
                t = 255;
            }
            this.YTable[ZIGZAG_PATTERN[i]] = t;
        }

        for (let j = 0; j < 64; j++) {
            let u = Math.floor((UVQT[j] * sf + 50) / 100);
            if (u < 1) {
                u = 1;
            } else if (u > 255) {
                u = 255;
            }
            this.UVTable[ZIGZAG_PATTERN[j]] = u;
        }

        let k = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.Y_forward_table[k] = (1.0 / (this.YTable[ZIGZAG_PATTERN[k]] * AASF[row] * AASF[col] * 8.0));
                this.UV_forward_table[k] = (1.0 / (this.UVTable[ZIGZAG_PATTERN[k]] * AASF[row] * AASF[col] * 8.0));
                k++;
            }
        }
    }

    private initCategoryNumber() {
        let nrlower = 1;
        let nrupper = 2;
        for (let cat = 1; cat <= 15; cat++) {
            //Positive numbers
            for (let nr = nrlower; nr < nrupper; nr++) {
                this.category[32767 + nr] = cat;
                this.bitcode[32767 + nr] = [nr, cat];
            }
            //Negative numbers
            for (let nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
                this.category[32767 + nrneg] = cat;
                this.bitcode[32767 + nrneg] = [nrupper - 1 + nrneg, cat];
            }
            nrlower <<= 1;
            nrupper <<= 1;
        }
    }

    private writeByte(value: number) {
        this.byteout.push(value);
    }

    private writeWord(value: number) {
        this.writeByte((value >> 8) & 0xFF);
        this.writeByte((value) & 0xFF);
    }

    // When writing bits, we have to watch out for 0xFF byte, and stuff a 0x00 after it
    private writeBits(bs: [number, number]) {
        let value = bs[0];
        let posval = bs[1] - 1;
        while (posval >= 0) {
            if (value & (1 << posval)) {
                this.bytenew |= (1 << this.bytepos);
            }
            posval--;
            this.bytepos--;
            if (this.bytepos < 0) {
                if (this.bytenew == 0xFF) {
                    this.writeByte(0xFF);
                    this.writeByte(0);
                }
                else {
                    this.writeByte(this.bytenew);
                }
                this.bytepos = 7;
                this.bytenew = 0;
            }
        }
    }

    // TODO: rewrite as constant list of bytes
    private writeAPP0() {
        this.writeWord(0xFFE0); // marker
        this.writeWord(16); // length
        this.writeByte(0x4A); // J
        this.writeByte(0x46); // F
        this.writeByte(0x49); // I
        this.writeByte(0x46); // F
        this.writeByte(0); // = "JFIF",'\0'
        this.writeByte(1); // versionhi
        this.writeByte(1); // versionlo
        this.writeByte(0); // xyunits
        this.writeWord(1); // xdensity
        this.writeWord(1); // ydensity
        this.writeByte(0); // thumbnwidth
        this.writeByte(0); // thumbnheight
    }

    // TODO: rewrite as constant list of bytes
    private writeSOF0(width: any, height: any) {
        this.writeWord(0xFFC0); // marker
        this.writeWord(17);   // length, truecolor YUV JPG
        this.writeByte(8);    // precision
        this.writeWord(height);
        this.writeWord(width);
        this.writeByte(3);    // nrofcomponents
        this.writeByte(1);    // IdY
        this.writeByte(0x11); // HVY
        this.writeByte(0);    // QTY
        this.writeByte(2);    // IdU
        this.writeByte(0x11); // HVU
        this.writeByte(1);    // QTU
        this.writeByte(3);    // IdV
        this.writeByte(0x11); // HVV
        this.writeByte(1);    // QTV
    }

    private writeDQT() {
        this.writeWord(0xFFDB); // marker
        this.writeWord(132);    // length
        this.writeByte(0);
        for (let i = 0; i < 64; i++) {
            this.writeByte(this.YTable[i]);
        }
        this.writeByte(1);
        for (let j = 0; j < 64; j++) {
            this.writeByte(this.UVTable[j]);
        }
    }

    private writeDHT() {
        this.writeWord(0xFFC4); // marker
        this.writeWord(0x01A2); // length

        this.writeByte(0); // HTYDCinfo
        for (let i = 0; i < 16; i++) {
            this.writeByte(STD_DC_LUMINANCE_NRCODE[i + 1]);
        }
        for (let j = 0; j <= 11; j++) {
            this.writeByte(STD_DC_LUMINANCE_VALUES[j]);
        }

        this.writeByte(0x10); // HTYACinfo
        for (let k = 0; k < 16; k++) {
            this.writeByte(STD_AC_LUMINANCE_NRCODES[k + 1]);
        }
        for (let l = 0; l <= 161; l++) {
            this.writeByte(STD_AC_LUMINANCE_VALUES[l]);
        }

        this.writeByte(1); // HTUDCinfo
        for (let m = 0; m < 16; m++) {
            this.writeByte(STD_DC_CHROMINANCE_NRCODES[m + 1]);
        }
        for (let n = 0; n <= 11; n++) {
            this.writeByte(STD_DC_CHROMINANCE_VALUES[n]);
        }

        this.writeByte(0x11); // HTUACinfo
        for (let o = 0; o < 16; o++) {
            this.writeByte(STD_AC_CHROMINANCE_NRCODES[o + 1]);
        }
        for (let p = 0; p <= 161; p++) {
            this.writeByte(STD_AC_CHROMINANCE_VALUES[p]);
        }
    }

    // TODO: rewrite as constant list of bytes
    private writeSOS() {
        this.writeWord(0xFFDA); // marker
        this.writeWord(12); // length
        this.writeByte(3); // nrofcomponents
        this.writeByte(1); // IdY
        this.writeByte(0); // HTY
        this.writeByte(2); // IdU
        this.writeByte(0x11); // HTU
        this.writeByte(3); // IdV
        this.writeByte(0x11); // HTV
        this.writeByte(0); // Ss
        this.writeByte(0x3f); // Se
        this.writeByte(0); // Bf
    }

    private fDCTQuant(data: Array<number>, fdtbl: Array<number>): Array<number> {
        let d0: number, d1: number, d2: number, d3: number, d4: number, d5: number, d6: number, d7: number;

        /* Pass 1: process rows. */
        let dataOff = 0;
        for (let i = 0; i < 8; ++i) {
            d0 = data[dataOff];
            d1 = data[dataOff + 1];
            d2 = data[dataOff + 2];
            d3 = data[dataOff + 3];
            d4 = data[dataOff + 4];
            d5 = data[dataOff + 5];
            d6 = data[dataOff + 6];
            d7 = data[dataOff + 7];

            let tmp0 = d0 + d7;
            let tmp7 = d0 - d7;
            let tmp1 = d1 + d6;
            let tmp6 = d1 - d6;
            let tmp2 = d2 + d5;
            let tmp5 = d2 - d5;
            let tmp3 = d3 + d4;
            let tmp4 = d3 - d4;

            /* Even part */
            let tmp10 = tmp0 + tmp3;    /* phase 2 */
            let tmp13 = tmp0 - tmp3;
            let tmp11 = tmp1 + tmp2;
            let tmp12 = tmp1 - tmp2;

            data[dataOff] = tmp10 + tmp11; /* phase 3 */
            data[dataOff + 4] = tmp10 - tmp11;

            let z1 = (tmp12 + tmp13) * 0.707106781; /* c4 */
            data[dataOff + 2] = tmp13 + z1; /* phase 5 */
            data[dataOff + 6] = tmp13 - z1;

            /* Odd part */
            tmp10 = tmp4 + tmp5; /* phase 2 */
            tmp11 = tmp5 + tmp6;
            tmp12 = tmp6 + tmp7;

            /* The rotator is modified from fig 4-8 to avoid extra negations. */
            let z5 = (tmp10 - tmp12) * 0.382683433; /* c6 */
            let z2 = 0.541196100 * tmp10 + z5; /* c2-c6 */
            let z4 = 1.306562965 * tmp12 + z5; /* c2+c6 */
            let z3 = tmp11 * 0.707106781; /* c4 */

            let z11 = tmp7 + z3;    /* phase 5 */
            let z13 = tmp7 - z3;

            data[dataOff + 5] = z13 + z2;    /* phase 6 */
            data[dataOff + 3] = z13 - z2;
            data[dataOff + 1] = z11 + z4;
            data[dataOff + 7] = z11 - z4;

            dataOff += 8; /* advance pointer to next row */
        }

        /* Pass 2: process columns. */
        dataOff = 0;
        for (let i = 0; i < 8; ++i) {
            d0 = data[dataOff];
            d1 = data[dataOff + 8];
            d2 = data[dataOff + 16];
            d3 = data[dataOff + 24];
            d4 = data[dataOff + 32];
            d5 = data[dataOff + 40];
            d6 = data[dataOff + 48];
            d7 = data[dataOff + 56];

            let tmp0p2 = d0 + d7;
            let tmp7p2 = d0 - d7;
            let tmp1p2 = d1 + d6;
            let tmp6p2 = d1 - d6;
            let tmp2p2 = d2 + d5;
            let tmp5p2 = d2 - d5;
            let tmp3p2 = d3 + d4;
            let tmp4p2 = d3 - d4;

            /* Even part */
            let tmp10p2 = tmp0p2 + tmp3p2;    /* phase 2 */
            let tmp13p2 = tmp0p2 - tmp3p2;
            let tmp11p2 = tmp1p2 + tmp2p2;
            let tmp12p2 = tmp1p2 - tmp2p2;

            data[dataOff] = tmp10p2 + tmp11p2; /* phase 3 */
            data[dataOff + 32] = tmp10p2 - tmp11p2;

            let z1p2 = (tmp12p2 + tmp13p2) * 0.707106781; /* c4 */
            data[dataOff + 16] = tmp13p2 + z1p2; /* phase 5 */
            data[dataOff + 48] = tmp13p2 - z1p2;

            /* Odd part */
            tmp10p2 = tmp4p2 + tmp5p2; /* phase 2 */
            tmp11p2 = tmp5p2 + tmp6p2;
            tmp12p2 = tmp6p2 + tmp7p2;

            /* The rotator is modified from fig 4-8 to avoid extra negations. */
            let z5p2 = (tmp10p2 - tmp12p2) * 0.382683433; /* c6 */
            let z2p2 = 0.541196100 * tmp10p2 + z5p2; /* c2-c6 */
            let z4p2 = 1.306562965 * tmp12p2 + z5p2; /* c2+c6 */
            let z3p2 = tmp11p2 * 0.707106781; /* c4 */
            let z11p2 = tmp7p2 + z3p2;    /* phase 5 */
            let z13p2 = tmp7p2 - z3p2;

            data[dataOff + 40] = z13p2 + z2p2; /* phase 6 */
            data[dataOff + 24] = z13p2 - z2p2;
            data[dataOff + 8] = z11p2 + z4p2;
            data[dataOff + 56] = z11p2 - z4p2;

            dataOff++; /* advance pointer to next column */
        }

        // Quantize/descale the coefficients
        for (let i = 0; i < 64; ++i) {
            // Apply the quantization and scaling factor & Round to nearest integer
            let fDCTQuant = data[i] * fdtbl[i];
            this.outputfDCTQuant[i] = (fDCTQuant > 0.0) ? ((fDCTQuant + 0.5) | 0) : ((fDCTQuant - 0.5) | 0);

        }
        return this.outputfDCTQuant;
    }

    private processDU(current_block_values: Array<number>, forward_table: Array<number>, DC: number, huffman_table_DC: Array<[number, number]>, huffman_table_AC: Array<[number, number]>, secret_message: Array<number>, embedSize: number) {
        let EOB = huffman_table_AC[0x00];
        let M16zeroes = huffman_table_AC[0xF0];
        let pos: number;

        let DU_DCT = this.fDCTQuant(current_block_values, forward_table);

        //ZIGZAG_PATTERN reorder
        for (let j = 0; j < 64; ++j) {
            this.DU[ZIGZAG_PATTERN[j]] = DU_DCT[j];
        }
        let diff = this.DU[0] - DC;
        DC = this.DU[0];

        //Encode DC
        if (diff == 0) {
            this.writeBits(huffman_table_DC[0]); // diff might be 0
        } else {
            pos = 32767 + diff;
            this.writeBits(huffman_table_DC[this.category[pos]]);
            this.writeBits(this.bitcode[pos]);
        }

        //Encode ACs
        let end0pos = 63;
        for (; (end0pos > 0) && (this.DU[end0pos] == 0); end0pos--) { };

        if (end0pos == 0) {
            this.writeBits(EOB);
            return DC;
        }

        for (let j = 0; (j < end0pos) && (j < embedSize) && secret_message.length; j++) {
            this.DU[j + 1] = this.DU[j + 1] ^ (this.DU[j + 1] & 0b11) + (secret_message.shift()! << 1) | 1;
            // We do not want to break negative numbers:
            // Extract the last 2 bits of the current value
            // DU[j + 1] & 0b11
            // Remove the last 2 bits of the current value
            // DU[j + 1] ^ (DU[j + 1] & 0b11
            // Change the last 2 bits of the current value to the current secret message bit and keep last bit true
            // DU[j + 1] ^ (DU[j + 1] & 0b11) + (secret_message.shift() << 1) | 1
        }

        let i = 1;
        let lng: number;

        while (i <= end0pos) {
            let startpos = i;
            for (; (this.DU[i] == 0) && (i <= end0pos); ++i) { }
            let nrzeroes = i - startpos;
            if (nrzeroes >= 16) {
                lng = nrzeroes >> 4;
                for (let nrmarker = 1; nrmarker <= lng; ++nrmarker)
                    this.writeBits(M16zeroes);
                nrzeroes = nrzeroes & 0xF;
            }
            pos = 32767 + this.DU[i];
            this.writeBits(huffman_table_AC[(nrzeroes << 4) + this.category[pos]]);
            this.writeBits(this.bitcode[pos]);
            i++;
        }
        if (end0pos != 0x3F) {
            this.writeBits(EOB);
        }
        return DC;
    }

    public encode(image: { width: number; height: number; data: Uint8ClampedArray; }, data: { secret: Array<number>, embedSize: number }) {
        // Initialize bit writer
        this.byteout = new Array();
        this.bytenew = 0;
        this.bytepos = 7;

        // Add JPEG headers
        this.writeWord(0xFFD8); // SOI
        this.writeAPP0();
        this.writeDQT();
        this.writeSOF0(image.width, image.height);
        this.writeDHT();
        this.writeSOS();

        // Encode 8x8 macroblocks
        let DCY = 0;
        let DCU = 0;
        let DCV = 0;

        this.bytenew = 0;
        this.bytepos = 7;

        let imageData = image.data;
        let width = image.width;
        let height = image.height;

        let quadWidth = width * 4;

        let x = 0, y = 0;
        let r: number, g: number, b: number;
        let start: number, p: number, col: number, row: number, pos: number;
        while (y < height) {
            x = 0;
            while (x < quadWidth) {
                start = quadWidth * y + x;
                p = start;
                col = -1;
                row = 0;

                for (pos = 0; pos < 64; pos++) {
                    row = pos >> 3;// /8
                    col = (pos & 7) * 4; // %8
                    p = start + (row * quadWidth) + col;

                    if (y + row >= height) { // padding bottom
                        p -= (quadWidth * (y + 1 + row - height));
                    }

                    if (x + col >= quadWidth) { // padding right
                        p -= ((x + col) - quadWidth + 4)
                    }

                    r = imageData[p++];
                    g = imageData[p++];
                    b = imageData[p++];
                    p++; // skip alpha channel

                    // /* calculate YUV values dynamically 
                    this.Y_current_block_values[pos] = (((0.29900) * r + (0.58700) * g + (0.11400) * b)) - 128; //-0x80
                    this.U_current_block_values[pos] = (((-0.16874) * r + (-0.33126) * g + (0.50000) * b));
                    this.V_current_block_values[pos] = (((0.50000) * r + (-0.41869) * g + (-0.08131) * b));
                    // */

                    // use lookup table (slightly faster)
                    // this.Y_current_block_values[pos] = ((RGB_YUV_TABLE[r] + RGB_YUV_TABLE[(g + 256) >> 0] + RGB_YUV_TABLE[(b + 512) >> 0]) >> 16) - 128;
                    // this.U_current_block_values[pos] = ((RGB_YUV_TABLE[(r + 768) >> 0] + RGB_YUV_TABLE[(g + 1024) >> 0] + RGB_YUV_TABLE[(b + 1280) >> 0]) >> 16) - 128;
                    // this.V_current_block_values[pos] = ((RGB_YUV_TABLE[(r + 1280) >> 0] + RGB_YUV_TABLE[(g + 1536) >> 0] + RGB_YUV_TABLE[(b + 1792) >> 0]) >> 16) - 128;

                }

                DCY = this.processDU(
                    this.Y_current_block_values,
                    this.Y_forward_table,
                    DCY,
                    this.YDC_huffman_table,
                    this.YAC_huffman_table,
                    data.secret,
                    data.embedSize
                );
                DCU = this.processDU(
                    this.U_current_block_values,
                    this.UV_forward_table,
                    DCU,
                    this.UVDC_huffman_table,
                    this.UVAC_huffman_table,
                    data.secret,
                    data.embedSize
                );
                DCV = this.processDU(
                    this.V_current_block_values,
                    this.UV_forward_table,
                    DCV,
                    this.UVDC_huffman_table,
                    this.UVAC_huffman_table,
                    data.secret,
                    data.embedSize
                );
                x += 32;
            }
            y += 8;
        }

        ////////////////////////////////////////////////////////////////

        // Do the bit alignment of the EOI marker
        if (this.bytepos >= 0)
            this.writeBits([this.bytepos + 1, (1 << (this.bytepos + 1)) - 1]);

        this.writeWord(0xFFD9); //EOI

        return Uint8ClampedArray.from(this.byteout);
    }

}