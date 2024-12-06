import { computed, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ImageComparisonService {
  public left = signal<ImageData | undefined>(undefined);
  public right = signal<ImageData | undefined>(undefined);

  public images = computed(() => {
    return [this.left(), this.right()];
  });

  public addImage(which: "left" | "right", image: ImageData): Promise<boolean> {
    // Resolve false only when the image is not the same size as the other image
    const promise = new Promise<boolean>((resolve) => {
      const left = this.left();
      const right = this.right();
      let canAdd = false;

      switch (which) {
        case "left":
          canAdd =
            right == null ||
            (right.width == image.width && right.height == image.height);
          if (canAdd) this.left.set(image);
          break;

        case "right":
          canAdd =
            left == null ||
            (left.width == image.width && left.height == image.height);
          if (canAdd) this.right.set(image);
          break;
      }
      resolve(canAdd);
    });
    return promise;
  }

  public clear(which?: "left" | "right") {
    if (!which) {
      this.left.set(undefined);
      this.right.set(undefined);
    } else {
      this[which].set(undefined);
    }
  }
}
