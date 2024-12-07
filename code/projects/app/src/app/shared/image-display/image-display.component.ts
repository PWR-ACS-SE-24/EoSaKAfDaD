import {
  animate,
  AnimationEvent,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { drawOn } from "../../util/image-data";
import {
  ImageComparisonService,
  Side,
} from "../image-comparison/image-comparison.service";

type Flash = "red" | "green" | "default";

@Component({
  selector: "app-image-display",
  templateUrl: "./image-display.component.html",
  styleUrl: "./image-display.component.css",
  animations: [
    trigger("flash", [
      state("red", style({ backgroundColor: "var(--app-red)" })),
      state("green", style({ backgroundColor: "var(--app-green)" })),
      state("default", style({ backgroundColor: "var(--app-navy)" })),
      transition("red => default", animate("300ms")),
      transition("green => default", animate("300ms")),
      transition("default => red", animate("0ms")),
      transition("default => green", animate("0ms")),
    ]),
  ],
})
export class ImageDisplayComponent {
  private readonly imageLocalStorage = inject(ImageComparisonService);

  public readonly image = input<ImageData>();
  public readonly showButtons = input(true);

  protected readonly showControls = computed(
    () => this.image() !== undefined && this.showButtons(),
  );

  private readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");

  protected readonly state = {
    left: signal<Flash>("default"),
    right: signal<Flash>("default"),
  };

  public constructor() {
    effect(() => {
      drawOn(this.image(), this.canvas().nativeElement);
    });
  }

  protected clearState(event: AnimationEvent, which: Side) {
    if (event.fromState === "default") {
      this.state[which].set("default");
    }
  }

  private flash(which: Side, type: Flash) {
    this.state[which].set(type);
  }

  public addImage(which: Side) {
    const image = this.image();
    if (image === undefined) return;
    const imageStorageResult = this.imageLocalStorage.addImage(which, image);
    this.flash(which, imageStorageResult ? "green" : "red");
  }
}
