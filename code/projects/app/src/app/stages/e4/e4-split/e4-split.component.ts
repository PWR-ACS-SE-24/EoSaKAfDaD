import { Component, computed, signal } from "@angular/core";
import { vcIsMonochrome, vcSplit } from "steg";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";

@Component({
  selector: "app-e4-split",
  templateUrl: "./e4-split.component.html",
  styleUrl: "./e4-split.component.css",
  imports: [
    ImageUploadComponent,
    ImageDisplayComponent,
    ImageDownloadComponent,
  ],
})
export class E4SplitComponent {
  protected readonly image = signal<ImageData | undefined>(undefined);

  protected readonly layers = computed(() => {
    const image = this.image();
    return image
      ? vcSplit(image, Date.now())
      : ([undefined, undefined] as const);
  });

  protected readonly uploadValidators = [
    {
      validate: vcIsMonochrome,
      message: "Obraz musi być monochromatyczny!",
    },
  ];
}
