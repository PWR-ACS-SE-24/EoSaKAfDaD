import { Component, signal } from "@angular/core";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { FileDownloadComponent } from "../../../shared/file-download/file-download.component";

@Component({
  selector: "app-e5-encode",
  imports: [ImageDisplayComponent, ImageUploadComponent, FileDownloadComponent],
  templateUrl: "./e5-encode.component.html",
  styleUrl: "./e5-encode.component.css",
})
export class E5EncodeComponent {
  protected readonly image = signal<ImageData | undefined>(undefined);

  protected onKeyChange(event: Event): void {}

  protected onTextChange(event: Event): void {}

  protected newImage(): ImageData | undefined {
    return undefined;
  }
  protected newFile(): File | undefined {
    return undefined;
  }
}
