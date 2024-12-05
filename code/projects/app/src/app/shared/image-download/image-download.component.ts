import { Component, effect, input, signal } from "@angular/core";
import { dataUrl } from "../../util/image-data";

type DownloadData = {
  fileHash: string;
  pathPng: string;
  pathJpeg: string;
  pathWebp: string;
} | null;

@Component({
  selector: "app-image-download",
  standalone: true,
  imports: [],
  templateUrl: "./image-download.component.html",
  styleUrl: "./image-download.component.css",
})
export class ImageDownloadComponent {
  public readonly image = input<ImageData>();
  protected readonly data = signal<DownloadData | undefined>(undefined);

  public constructor() {
    effect(() => {
      const image = this.image();
      if (!image) return;

      crypto.subtle.digest("SHA-1", image.data).then((hash) => {
        const fileHash = Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .slice(0, 16);
        const pathPng = dataUrl(image, "image/png");
        const pathJpeg = dataUrl(image, "image/jpeg");
        const pathWebp = dataUrl(image, "image/webp");
        this.data.set({ fileHash, pathPng, pathJpeg, pathWebp });
      });
    });
  }
}
