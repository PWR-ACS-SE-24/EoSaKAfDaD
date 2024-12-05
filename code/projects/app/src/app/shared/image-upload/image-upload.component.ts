import { Component, EventEmitter, Input, Output } from "@angular/core";
import { fromFile } from "../../util/image-data";

type Validator = {
  validate: (image: ImageData) => boolean;
  message: string;
};

@Component({
    selector: "app-image-upload",
    imports: [],
    templateUrl: "./image-upload.component.html",
    styleUrl: "./image-upload.component.css"
})
export class ImageUploadComponent {
  @Output() public readonly imageChange = new EventEmitter<ImageData>();
  @Input() public validators: Validator[] = [];
  @Output() public readonly fileChange = new EventEmitter<File>();

  protected readonly inputId = crypto.randomUUID();
  protected readonly supportedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  protected isHovered = false;
  protected flashClass: "red" | "green" | null = null;
  private flashTimeout: number | null = null;

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

  private flash(type: "red" | "green"): void {
    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
      this.flashTimeout = null;
    }
    this.flashClass = null;
    requestAnimationFrame(() => (this.flashClass = type));
    this.flashTimeout = window.setTimeout(() => (this.flashClass = null), 2000);
  }

  protected onInputChange(event: Event): void {
    this.cancelEvent(event);
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;
    this.handleFile(input.files?.[0]);
  }

  private handleFile(file: File | null | undefined): void {
    requestAnimationFrame(() => {
      if (!file || !this.supportedMimeTypes.includes(file.type)) {
        this.flash("red");
        alert("Niewspierany format pliku!");
        return;
      }

      fromFile(file).then((image) => {
        for (const validator of this.validators) {
          if (!validator.validate(image)) {
            this.flash("red");
            alert(validator.message);
            return;
          }
        }

        this.imageChange.emit(image);
        this.fileChange.emit(file);
        this.flash("green");
      });
    });
  }
}
