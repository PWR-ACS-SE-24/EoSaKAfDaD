import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import { toolBrightness, toolContrast, toolNoise, toolScale } from "steg";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { computedOpt } from "../../../util/computed-opt";
import { SliderComponent } from "../slider/slider.component";

@Component({
  selector: "app-e3-editor",
  imports: [
    CommonModule,
    SliderComponent,
    ImageDisplayComponent,
    ImageUploadComponent,
    ImageDownloadComponent,
  ],
  templateUrl: "./e3-editor.component.html",
  styleUrl: "./e3-editor.component.css",
})
export class E3EditorComponent {
  protected readonly scale = signal(100);
  protected readonly noise = signal(0);
  protected readonly brightness = signal(0);
  protected readonly contrast = signal(0);
  protected readonly image = signal<ImageData | undefined>(undefined);
  protected readonly newImage;

  public constructor() {
    const scaled = computedOpt(this.image, (i) => toolScale(i, this.scale()));
    const noised = computedOpt(scaled, (i) =>
      toolNoise(i, this.noise(), Date.now()),
    );
    const brightened = computedOpt(noised, (i) =>
      toolBrightness(i, this.brightness()),
    );
    const contrasted = computedOpt(brightened, (i) =>
      toolContrast(i, this.contrast()),
    );
    this.newImage = contrasted;
  }
}
