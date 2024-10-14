import { AppImage } from "./app-image";

export function highlightLsb(image: AppImage): AppImage {
  return image.mapBytes((byte) => ((byte & 1) === 1 ? 255 : 0));
}
