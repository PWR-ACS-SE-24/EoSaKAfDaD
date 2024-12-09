import { AnimationEvent } from "@angular/animations";
import { Component, input, output, signal } from "@angular/core";
import { fromFile } from "../../util/image-data";
import { Flash, flashAnimation } from "../animations/flash";

type Validator = {
  validate: (image: ImageData) => boolean;
  message: string;
};

@Component({
  selector: "app-image-upload",
  templateUrl: "./image-upload.component.html",
  styleUrl: "./image-upload.component.css",
  animations: [flashAnimation("var(--app-white)")],
})
export class ImageUploadComponent {
  public readonly validators = input<Validator[]>([]);
  public readonly imageChange = output<ImageData>();
  public readonly fileChange = output<File>();

  protected readonly flashState = signal<Flash>("default");

  protected readonly inputId = crypto.randomUUID();
  protected readonly supportedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  protected isHovered = false;

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

  private flash(type: Flash): void {
    this.flashState.set(type);
  }

  protected clearState(event: AnimationEvent): void {
    if (event.fromState === "default") {
      this.flashState.set("default");
    }
  }

  private handleFile(file: File | null | undefined): void {
    requestAnimationFrame(() => {
      if (!file || !this.supportedMimeTypes.includes(file.type)) {
        this.flash("red");
        alert("Niewspierany format pliku!");
        return;
      }

      fromFile(file).then((image) => {
        for (const validator of this.validators()) {
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
