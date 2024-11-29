import { Component, EventEmitter, Output } from "@angular/core";
import { fromFile } from "../../util/image-data";

@Component({
  selector: "app-image-upload",
  standalone: true,
  imports: [],
  templateUrl: "./image-upload.component.html",
  styleUrl: "./image-upload.component.css",
})
export class ImageUploadComponent {
  @Output() public readonly imageChange = new EventEmitter<ImageData>();

  protected readonly inputId = crypto.randomUUID();
  protected readonly supportedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  protected isHovered = false;
  protected isFlashRed = false;
  protected isFlashGreen = false;

  protected cancelEvent(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  protected onDragOver(event: DragEvent): void {
    this.cancelEvent(event);
    this.isHovered = true;
  }

  protected onDragLeave(event: DragEvent): void {
    this.cancelEvent(event);
    this.isHovered = false;
  }

  protected onDrop(event: DragEvent): void {
    this.cancelEvent(event);
    this.isHovered = false;
    this.handleFile(event.dataTransfer?.files?.[0]);
  }

  protected onInputChange(event: Event): void {
    this.cancelEvent(event);
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;
    this.handleFile(input.files?.[0]);
  }

  private handleFile(file: File | null | undefined): void {
    this.isFlashRed = false;
    this.isFlashGreen = false;

    requestAnimationFrame(() => {
      if (!file || !this.supportedMimeTypes.includes(file.type)) {
        this.isFlashRed = true;
        setTimeout(() => (this.isFlashRed = false), 2000);
        return;
      }

      fromFile(file).then((image) => {
        this.imageChange.emit(image);
        this.isFlashGreen = true;
        setTimeout(() => (this.isFlashGreen = false), 2000);
      });
    });
  }
}
