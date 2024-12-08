import { Component, computed, signal } from "@angular/core";
import { lsb2embedText, lsb2extractText, lsbHighlight } from "steg";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { computedOpt } from "../../../util/computed-opt";
import { debouncedSignal } from "../../../util/debounced-signal";

@Component({
  selector: "app-e1v2",
  imports: [
    ImageUploadComponent,
    ImageDisplayComponent,
    ImageDownloadComponent,
  ],
  templateUrl: "./e1v2.component.html",
  styleUrl: "./e1v2.component.css",
})
export class E1V2Component {
  protected readonly textContent = signal("");
  private readonly debouncedText = debouncedSignal(this.textContent, 100);

  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly newImage = computedOpt(this.image, (i) =>
    lsb2embedText(i, this.debouncedText()),
  );
  protected readonly lsbImage = computedOpt(this.newImage, lsbHighlight);

  protected readonly textBound = computed(() => {
    const image = this.image();
    return image ? Math.floor((image.width * image.height) / 2) : 0;
  });

  protected onNextImage(image: ImageData): void {
    this.image.set(image);
    this.textContent.set(lsb2extractText(image));
  }

  protected onTextChange(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;
    const updated = target.value.slice(0, this.textBound());
    this.textContent.set(updated);
    target.value = updated;
  }
}
