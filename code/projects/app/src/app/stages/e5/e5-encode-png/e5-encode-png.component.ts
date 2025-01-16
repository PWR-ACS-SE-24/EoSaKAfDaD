import { Component, inject, signal } from "@angular/core";
import { FileDownloadComponent } from "../../../shared/file-download/file-download.component";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { asyncComputed } from "../../../util/async-computed";
import { debouncedSignal } from "../../../util/debounced-signal";
import { fromFile } from "../../../util/image-data";
import { PngMetaService } from "../e5-services/png-meta.service";

@Component({
  selector: "app-e5-encode-png",
  imports: [ImageDisplayComponent, ImageUploadComponent, FileDownloadComponent],
  templateUrl: "./e5-encode-png.component.html",
  styleUrl: "./e5-encode-png.component.css",
})
export class E5EncodePngComponent {
  private readonly pngMetaService = inject(PngMetaService);

  protected readonly keyContent = signal("");
  protected readonly textContent = signal("");
  private readonly debouncedKey = debouncedSignal(this.keyContent, 300);
  private readonly debouncedText = debouncedSignal(this.textContent, 300);

  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly file = signal<File | undefined>(undefined);

  protected readonly newFile = asyncComputed(undefined, async () => {
    const file = this.file();
    if (!file) return undefined;
    return this.pngMetaService.encode(
      file,
      this.debouncedKey(),
      this.debouncedText(),
    );
  });

  protected readonly newImage = asyncComputed(undefined, async () => {
    const file = this.newFile();
    if (!file) return undefined;
    return fromFile(file);
  });

  protected onKeyChange(event: Event): void {
    const key = (event.target as HTMLInputElement).value;
    this.keyContent.set(key);
  }

  protected onTextChange(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.textContent.set(text);
  }
}
