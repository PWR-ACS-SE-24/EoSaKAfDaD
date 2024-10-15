import { chunk, dropRightWhile, flow, map, join } from "lodash/fp";
import { AppImage } from "./app-image";

export function highlightLsb(image: AppImage): AppImage {
  return image.mapBytes((byte) => ((byte & 1) === 1 ? 255 : 0));
}

export function embedText(image: AppImage, text: string): AppImage {
  const bits = text
    .split("")
    .flatMap((char) =>
      char.charCodeAt(0).toString(2).slice(-7).padStart(7, "0").split("")
    )
    .map(Number);

  return image.mapBytes((byte, index) => {
    const clear = byte & 254;
    return index < bits.length ? clear | bits[index] : clear;
  });
}

export function extractText(image: AppImage): string {
  return flow(
    map((byte: number) => byte & 1),
    chunk(7),
    dropRightWhile(
      (bits: number[]) => bits.length !== 7 || bits.every((bit) => bit === 0)
    ),
    map((bits: number[]) => String.fromCharCode(parseInt(bits.join(""), 2))),
    join("")
  )(image.bytes);
}
