import { Component, inject, signal } from "@angular/core";
import { FileDownloadComponent } from "../../../shared/file-download/file-download.component";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { asyncComputed } from "../../../util/async-computed";
import { debouncedSignal } from "../../../util/debounced-signal";
import { fromFile } from "../../../util/image-data";
import { JpgMetaService } from "../e5-services/jpg-meta.service";

@Component({
  selector: "app-e5-encode-jpg",
  imports: [ImageDisplayComponent, ImageUploadComponent, FileDownloadComponent],
  templateUrl: "./e5-encode-jpg.component.html",
  styleUrl: "./e5-encode-jpg.component.css",
})
export class E5EncodeJpgComponent {
  private readonly jpgMetaService = inject(JpgMetaService);

  protected readonly textContent = signal("");

  private readonly debouncedText = debouncedSignal(this.textContent, 300);
  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly file = signal<File | undefined>(undefined);
  protected readonly newFile = asyncComputed(undefined, async () => {
    const file = this.file();
    if (!file) return undefined;
    return this.jpgMetaService.encode(file, this.debouncedText());
  });
  protected readonly newImage = asyncComputed(undefined, async () => {
    const file = this.newFile();
    if (!file) return undefined;
    return fromFile(file);
  });

  protected onTextChange(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.textContent.set(text);
  }
}
