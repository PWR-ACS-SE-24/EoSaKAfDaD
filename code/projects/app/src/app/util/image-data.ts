export function fromFile(file: File): Promise<ImageData> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = new OffscreenCanvas(image.width, image.height);
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        resolve(context.getImageData(0, 0, image.width, image.height));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function dataUrl(image: ImageData, type: string = "image/png"): string {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext("2d")!.putImageData(image, 0, 0);
  return canvas.toDataURL(type);
}

export function drawOn(image: ImageData, canvas: HTMLCanvasElement): void {
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext("2d")?.putImageData(image, 0, 0);
}
