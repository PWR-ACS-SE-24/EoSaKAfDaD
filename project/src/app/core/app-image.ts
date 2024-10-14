export class AppImage {
  private constructor(private readonly imageData: ImageData) {}

  public static fromFile(file: File): Promise<AppImage> {
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

  public drawOn(canvas: HTMLCanvasElement): void {
    canvas.width = this.imageData.width;
    canvas.height = this.imageData.height;
    canvas.getContext("2d")?.putImageData(this.imageData, 0, 0);
  }

  public mapBytes(callback: (byte: number) => number): AppImage {
    const data = new Uint8ClampedArray(this.imageData.data);
    for (let i = 0; i < data.length; i++) {
      data[i] = callback(this.imageData.data[i]);
    }
    return new AppImage(
      new ImageData(data, this.imageData.width, this.imageData.height)
    );
  }
}
