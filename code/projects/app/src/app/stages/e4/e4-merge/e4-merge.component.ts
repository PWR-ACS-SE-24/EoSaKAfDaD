import { Component, computed, signal } from "@angular/core";
import { map } from "rxjs";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { vcIsMonochrome, vcMakeMask } from "steg";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-e4-merge",
    templateUrl: "./e4-merge.component.html",
    styleUrl: "./e4-merge.component.css",
    imports: [FormsModule, ImageUploadComponent, ImageDisplayComponent]
})
export class E4MergeComponent {
  protected readonly leftInput = signal<ImageData | undefined>(undefined);
  protected readonly rightInput = signal<ImageData | undefined>(undefined);
  protected readonly offset = signal(0);

  protected readonly leftMask = computed(() => {
    const image = this.leftInput();
    return image ? vcMakeMask(image) : undefined;
  });
  protected readonly rightMask = computed(() => {
    const image = this.rightInput();
    return image ? vcMakeMask(image) : undefined;
  });

  protected readonly uploadValidators = [
    {
      validate: vcIsMonochrome,
      message: "Obraz musi być monochromatyczny!",
    },
  ];
}
