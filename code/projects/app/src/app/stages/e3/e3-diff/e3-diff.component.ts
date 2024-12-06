import { Component, computed, signal, Signal } from "@angular/core";
import { toolDifference } from "steg";
import { ImageComparisonService } from "../../../shared/image-comparison/image-comparison.service";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { SliderComponent } from "../slider/slider.component";

@Component({
  selector: "app-e3-diff",
  standalone: true,
  imports: [SliderComponent, ImageDisplayComponent, ImageDownloadComponent],
  templateUrl: "./e3-diff.component.html",
  styleUrl: "./e3-diff.component.css",
})
export class E3DiffComponent {
  protected readonly contrast = signal(0);
  protected readonly brightness = signal(0);

  protected readonly image: Signal<ImageData | undefined>;
  protected readonly left: Signal<ImageData | undefined>;
  protected readonly right: Signal<ImageData | undefined>;

  constructor(private readonly imageLocalStorage: ImageComparisonService) {
    this.left = this.imageLocalStorage.left;
    this.right = this.imageLocalStorage.right;

    this.image = computed(() => {
      const left = this.left();
      const right = this.right();
      if (left == null || right == null) return undefined;
      return toolDifference(left, right, this.contrast(), this.brightness());
    });
  }

  protected clearLeft() {
    this.imageLocalStorage.clear("left");
  }

  protected clearRight() {
    this.imageLocalStorage.clear("right");
  }
}
