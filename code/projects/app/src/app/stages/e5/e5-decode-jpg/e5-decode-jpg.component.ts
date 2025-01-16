import { Component, inject, signal } from "@angular/core";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { asyncComputed } from "../../../util/async-computed";
import { JpgMetaService } from "../e5-services/jpg-meta.service";

@Component({
  selector: "app-e5-decode-jpg",
  imports: [ImageDisplayComponent, ImageUploadComponent],
  templateUrl: "./e5-decode-jpg.component.html",
  styleUrl: "./e5-decode-jpg.component.css",
})
export class E5DecodeJpgComponent {
  private readonly jpgMetaService = inject(JpgMetaService);
  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly file = signal<File | undefined>(undefined);

  protected readonly textContent = asyncComputed("", async () => {
    const file = this.file();
    if (!file) return "";
    return (await this.jpgMetaService.decode(file)) ?? "";
  });
}
