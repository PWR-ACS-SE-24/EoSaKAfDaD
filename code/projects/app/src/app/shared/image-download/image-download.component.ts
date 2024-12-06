import { Component, input, resource } from "@angular/core";
import { dataUrl } from "../../util/image-data";

@Component({
  selector: "app-image-download",
  templateUrl: "./image-download.component.html",
  styleUrl: "./image-download.component.css",
})
export class ImageDownloadComponent {
  public readonly image = input<ImageData>();
  protected readonly data = resource({
    request: this.image,
    loader: async ({ request }) => {
      if (!request) return undefined;
      const hash = await crypto.subtle.digest("SHA-1", request.data);
      const fileHash = Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 16);
      const pathPng = dataUrl(request, "image/png");
      const pathJpeg = dataUrl(request, "image/jpeg");
      const pathWebp = dataUrl(request, "image/webp");
      return { fileHash, pathPng, pathJpeg, pathWebp };
    },
  }).value;
}
