import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, effect, ElementRef, input, viewChild } from "@angular/core";
import { drawOn } from "../../util/image-data";
import { ImageComparisonService } from "../image-comparison/image-comparison.service";

type Flash = "red" | "green" | "default";

@Component({
  selector: "app-image-display",
  templateUrl: "./image-display.component.html",
  styleUrl: "./image-display.component.css",
  animations: [
    trigger("flash", [
      state("red", style({ backgroundColor: "var(--app-red)" })),
      state("green", style({ backgroundColor: "var(--app-green)" })),
      state("*", style({ backgroundColor: "var(--app-navy)" })),
      transition("red => *", animate("300ms")),
      transition("green => *", animate("300ms")),
      transition("* => red", animate("0ms")),
      transition("* => green", animate("0ms")),
    ]),
  ],
})
export class ImageDisplayComponent {
  public readonly image = input<ImageData>();
  protected showButtons = input<boolean>(false);

  private readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");

  protected showControls = false;
  private currentImage: ImageData | null = null;

  protected state = { left: "default" as Flash, right: "default" as Flash };

  constructor(private readonly imageLocalStorage: ImageComparisonService) {
    effect(() => {
      drawOn(this.image(), this.canvas().nativeElement);
      this.showControls = this.showButtons();
    });
  }

  protected clearState(which: "left" | "right") {
    this.state[which] = "default";
  }

  private flash(which: "left" | "right", type: "red" | "green"): void {
    this.state[which] = type;
  }

  public addImage(which: "left" | "right") {
    if (this.currentImage == null) return;
    this.imageLocalStorage
      .addImage(which, this.currentImage)
      .then((result) => this.flash(which, result ? "green" : "red"));
  }
}
