import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, filter, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ImageComparisonService {
  protected left = new BehaviorSubject<ImageData | null>(null);
  protected right = new BehaviorSubject<ImageData | null>(null);

  public left$ = this.left.pipe(filter((image) => image !== null));
  public right$ = this.right.pipe(filter((image) => image !== null));

  // typescript please stop complaining
  public lastImages$ = combineLatest([this.left, this.right]).pipe(
    filter(([l, r]) => l !== null && r !== null),
  ) as Observable<[ImageData, ImageData]>;

  public addImage(which: "left" | "right", image: ImageData): Promise<boolean> {
    // Resolve false only when the image is not the same size as the other image
    const promise = new Promise<boolean>((resolve) => {
      const left = this.left.getValue();
      const right = this.right.getValue();
      let canAdd = false;

      switch (which) {
        case "left":
          canAdd =
            right == null ||
            (right.width == image.width && right.height == image.height);
          if (canAdd) this.left.next(image);
          break;

        case "right":
          canAdd =
            left == null ||
            (left.width == image.width && left.height == image.height);
          if (canAdd) this.right.next(image);
          break;
      }
      resolve(canAdd);
    });
    return promise;
  }

  public clear(which: "left" | "right") {
    this[which].next(null);
  }
}
