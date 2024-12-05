import { Component } from "@angular/core";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
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
  protected readonly contrastSubject = new BehaviorSubject(0);
  protected readonly brighnessSubject = new BehaviorSubject(0);

  protected readonly image$: Observable<ImageData>;
  protected readonly left$: Observable<ImageData>;
  protected readonly right$: Observable<ImageData>;

  constructor(private readonly imageLocalStorage: ImageComparisonService) {
    this.left$ = this.imageLocalStorage.left$;
    this.right$ = this.imageLocalStorage.right$;

    this.image$ = combineLatest([
      this.contrastSubject,
      this.brighnessSubject,
      this.imageLocalStorage.lastImages$,
    ]).pipe(
      map(([contrast, brightness, [left, right]]) => {
        return toolDifference(left, right, contrast, brightness);
      }),
    );
  }

  protected clear() {
    this.imageLocalStorage.clear("left");
    this.imageLocalStorage.clear("right");
  }
}
