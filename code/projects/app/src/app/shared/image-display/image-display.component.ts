import { Component, effect, ElementRef, input, viewChild } from "@angular/core";
import { drawOn } from "../../util/image-data";

@Component({
  selector: "app-image-display",
  templateUrl: "./image-display.component.html",
  styleUrl: "./image-display.component.css",
})
export class ImageDisplayComponent {
  public readonly image = input<ImageData>();

  private readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");

  public constructor() {
    effect(() => {
      drawOn(this.image(), this.canvas().nativeElement);
    });
  }
}
