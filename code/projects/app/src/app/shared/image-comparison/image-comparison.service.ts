import { computed, Injectable, signal } from "@angular/core";

export type Side = "left" | "right";

@Injectable({
  providedIn: "root",
})
export class ImageComparisonService {
  public readonly left = signal<ImageData | undefined>(undefined);
  public readonly right = signal<ImageData | undefined>(undefined);

  public readonly images = computed(() => {
    return [this.left(), this.right()] as const;
  });

  public addImage(which: Side, image: ImageData): boolean {
    // Return false if the image is not the same size as the other image
    const oppositeTo = { left: this.right(), right: this.left() };
    const canAdd =
      oppositeTo[which] == null ||
      (oppositeTo[which].width == image.width &&
        oppositeTo[which].height == image.height);
    if (canAdd) this[which].set(image);
    return canAdd;
  }

  public clear(which?: Side) {
    if (!which) {
      this.left.set(undefined);
      this.right.set(undefined);
    } else {
      this[which].set(undefined);
    }
  }
}
