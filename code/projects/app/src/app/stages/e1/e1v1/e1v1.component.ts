import { Component, computed, signal } from "@angular/core";
import { lsbHighlight, lsb1embedText, lsb1extractText } from "steg";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { computedOpt } from "../../../util/computed-opt";
import { debouncedSignal } from "../../../util/debounced-signal";

const ASCII_CHAR_BITS = 7;
const RGB_CHANNELS = 3;

@Component({
  selector: "app-e1v1",
  imports: [
    ImageUploadComponent,
    ImageDisplayComponent,
    ImageDownloadComponent,
  ],
  templateUrl: "./e1v1.component.html",
  styleUrl: "./e1v1.component.css",
})
export class E1V1Component {
  protected readonly textContent = signal("");
  private readonly debouncedText = debouncedSignal(this.textContent, 100);

  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly newImage = computedOpt(this.image, (i) =>
    lsb1embedText(i, this.debouncedText())
  );
  protected readonly lsbImage = computedOpt(this.newImage, lsbHighlight);
  protected readonly textBound = computed(() => {
    const image = this.image();
    return image
      ? Math.floor(
          (image.width * image.height * RGB_CHANNELS) / ASCII_CHAR_BITS
        )
      : 0;
  });

  protected onNextImage(image: ImageData): void {
    this.image.set(image);
    this.textContent.set(lsb1extractText(image));
  }

  protected onTextChange(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;
    this.textContent.set(
      target.value.replace(/[^\x00-\x7F]/g, "").slice(0, this.textBound())
    );
    target.value = this.textContent();
  }
}
