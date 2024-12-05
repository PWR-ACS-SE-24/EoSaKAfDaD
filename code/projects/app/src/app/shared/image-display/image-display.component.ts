import { Component, effect, ElementRef, input, viewChild } from "@angular/core";
import { drawOn } from "../../util/image-data";

@Component({
  selector: "app-image-display",
  standalone: true,
  imports: [],
  templateUrl: "./image-display.component.html",
  styleUrl: "./image-display.component.css",
})
export class ImageDisplayComponent {
  public readonly image = input<ImageData>();

  protected readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");

  public constructor() {
    effect(() => {
      const image = this.image();
      if (image) {
        drawOn(image, this.canvas().nativeElement);
      }
    });
  }
}
