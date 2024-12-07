import { Component, computed, signal } from "@angular/core";
import { FileDownloadComponent } from "../../../shared/file-download/file-download.component";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { asyncComputed } from "../../../util/async-computed";
import { computedOpt } from "../../../util/computed-opt";
import { debouncedSignal } from "../../../util/debounced-signal";
import { fromFile } from "../../../util/image-data";
import { SliderComponent } from "../../e3/slider/slider.component";
import { JPEGEncoder } from "../helpers/jpeg-encode";

@Component({
  selector: "app-e2-encode",
  imports: [
    ImageDisplayComponent,
    ImageUploadComponent,
    SliderComponent,
    FileDownloadComponent,
  ],
  templateUrl: "./e2-encode.component.html",
  styleUrl: "./e2-encode.component.css",
})
export class E2EncodeComponent {
  private readonly textEncoder = new TextEncoder();
  protected readonly textContent = signal("");
  private readonly debouncedText = debouncedSignal(this.textContent, 300);

  protected readonly quality = signal(100);
  protected readonly dataDensity = signal(1);

  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly newFile = computedOpt(this.image, (i) =>
    this.encodeFile(
      this.debouncedText(),
      this.quality(),
      this.dataDensity(),
      i,
    ),
  );
  protected readonly newImage = asyncComputed<ImageData | undefined>(
    undefined,
    async () => {
      const file = this.newFile();
      if (!file) return undefined;
      return fromFile(file);
    },
  );
  // The problem with length of encoded text is that we can't know for sure how
  //   many characters we can encode in the image. The number of characters
  //   depends not only on the image size, but also on the image content,
  //   jpeg quality and the chosen data density. We can get the exact amount
  //   of characters that can be encoded only after the image is encoded.
  // We can calculate upper bound as follows:
  //   floor((height * width) / 64) * 2 * dataDensity
  protected readonly textBound = computed(() => {
    const image = this.image();
    return image
      ? Math.floor((image.width * image.height) / 64) * 2 * this.dataDensity()
      : 0;
  });

  private encodeFile(
    text: string,
    quality: number,
    dataDensity: number,
    data: ImageData,
  ) {
    const encoder = new JPEGEncoder(quality);
    const encodedText = Array.from(this.textEncoder.encode(text))
      .flatMap((v) => Array.from(v.toString(2).padStart(8, "0")))
      .map((b) => parseInt(b));

    const encodedImage = encoder.encode(data, {
      embedSize: dataDensity,
      secret: encodedText,
    });

    return new File([encodedImage], `${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
  }

  protected onTextChange(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;
    this.textContent.set(target.value.slice(0, this.textBound()));
  }
}
