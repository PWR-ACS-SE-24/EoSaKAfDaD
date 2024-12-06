import { Component, signal } from "@angular/core";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";

@Component({
  selector: "app-e5-decode",
  imports: [ImageDisplayComponent, ImageUploadComponent],
  templateUrl: "./e5-decode.component.html",
  styleUrl: "./e5-decode.component.css",
})
export class E5DecodeComponent {
  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly file = signal<File | undefined>(undefined);

  protected textKey(): number {
    return 0;
  }

  protected onKeyChange(event: Event): void {}

  protected textContent(): string {
    return "";
  }
}
