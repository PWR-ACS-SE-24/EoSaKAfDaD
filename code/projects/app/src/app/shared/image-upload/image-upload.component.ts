import { Component, EventEmitter, Output } from "@angular/core";
import { AppImage } from "../../core/app-image";

@Component({
  selector: "app-image-upload",
  standalone: true,
  imports: [],
  templateUrl: "./image-upload.component.html",
  styleUrl: "./image-upload.component.css",
})
export class ImageUploadComponent {
  @Output() public readonly imageChange = new EventEmitter<AppImage>();

  protected readonly supportedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  protected onFileChange(event: Event): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;

    const file = input.files?.[0];
    if (!file || !this.supportedMimeTypes.includes(file.type)) return;

    AppImage.fromFile(file).then((image) => this.imageChange.emit(image));
  }
}
