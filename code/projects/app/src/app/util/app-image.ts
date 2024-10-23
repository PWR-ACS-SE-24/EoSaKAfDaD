import { AppImage } from "steg";

export function fromFile(file: File): Promise<AppImage> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = new OffscreenCanvas(image.width, image.height);
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);

        resolve(
          new AppImage(context.getImageData(0, 0, image.width, image.height))
        );
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function dataUrl(image: AppImage, type: string = "image/png"): string {
  const canvas = document.createElement("canvas");
  canvas.width = image.imageData.width;
  canvas.height = image.imageData.height;
  canvas.getContext("2d")?.putImageData(image.imageData, 0, 0);
  return canvas.toDataURL(type);
}

export function drawOn(image: AppImage, canvas: HTMLCanvasElement): void {
  canvas.width = image.imageData.width;
  canvas.height = image.imageData.height;
  canvas.getContext("2d")?.putImageData(image.imageData, 0, 0);
}
