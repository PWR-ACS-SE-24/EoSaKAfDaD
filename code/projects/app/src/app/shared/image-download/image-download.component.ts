import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
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
export class ImageDownloadComponent implements OnInit {
  @Input({ required: true }) public image$!: Observable<ImageData>;

  protected data: DownloadData = null;

  public ngOnInit(): void {
    this.image$.subscribe((image) => {
      crypto.subtle.digest("SHA-1", image.data).then((hash) => {
        const fileHash = Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .slice(0, 16);
        const pathPng = dataUrl(image, "image/png");
        const pathJpeg = dataUrl(image, "image/jpeg");
        const pathWebp = dataUrl(image, "image/webp");
        this.data = { fileHash, pathPng, pathJpeg, pathWebp };
      });
    });
  }
}
