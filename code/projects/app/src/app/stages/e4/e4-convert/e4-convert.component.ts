import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { vcMakeMonochrome } from "steg";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { FormsModule } from "@angular/forms";
import { computedOpt } from "../../../util/computed-opt";

@Component({
    selector: "app-e4-convert",
    templateUrl: "./e4-convert.component.html",
    styleUrl: "./e4-convert.component.css",
    imports: [
        CommonModule,
        FormsModule,
        ImageDisplayComponent,
        ImageUploadComponent,
        ImageDownloadComponent,
    ]
})
export class E4ConvertComponent {
  protected readonly grayscale = signal("luminosity");
  protected readonly dithering = signal("floyd-steinberg");
  protected readonly image = signal<ImageData | undefined>(undefined);

  protected readonly newImage = computedOpt(this.image, (i) =>
    vcMakeMonochrome(i, this.grayscale(), this.dithering())
  );
}
