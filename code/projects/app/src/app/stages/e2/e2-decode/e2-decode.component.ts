import { Component, computed, resource, signal } from "@angular/core";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { mimeValidator } from "../../../shared/image-upload/image-upload-validators";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { SliderComponent } from "../../e3/slider/slider.component";
import { JPEGDecoder } from "../helpers/jpeg-decode";

@Component({
  selector: "app-e2-decode",
  imports: [ImageDisplayComponent, ImageUploadComponent, SliderComponent],
  templateUrl: "./e2-decode.component.html",
  styleUrl: "./e2-decode.component.css",
})
export class E2DecodeComponent {
  private readonly textDecoder = new TextDecoder();

  protected readonly dataDensity = signal(1);

  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly file = signal<File | undefined>(undefined);
  protected readonly jpegDecoder = resource({
    request: () => this.file(),
    loader: async ({ request }) => {
      const buffer = await request?.arrayBuffer();
      return buffer ? this.decodeImage(buffer) : undefined;
    },
  }).value;

  protected readonly textContent = computed(() => {
    const decoder = this.jpegDecoder();
    if (!decoder) return "";
    return this.decodeTextFromDCT(decoder, this.dataDensity());
  });

  protected readonly uploadValidators = [mimeValidator(["image/jpeg"])];

  private decodeImage(file: ArrayBuffer) {
    const rawImage = new Uint8ClampedArray(file);
    const decoder = new JPEGDecoder(rawImage);
    decoder.parse();
    return decoder;
  }

  private decodeTextFromDCT(decoder: JPEGDecoder, dataDensity: number): string {
    const data = Array.from(decoder.getDCTEmbeddedData(dataDensity));
    const characters = new Uint8Array(Math.ceil(data.length / 8));
    for (let i = 0; i < Math.ceil(data.length / 8); i += 1) {
      characters[i] = data
        .slice(i * 8, (i + 1) * 8)
        .reduce((acc, bit) => acc * 2 + bit, 0);
    }
    return this.textDecoder.decode(characters);
  }
}
