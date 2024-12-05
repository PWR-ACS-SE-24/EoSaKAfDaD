import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageLocalStorageService {
  protected left  = new BehaviorSubject<ImageData | null>(null);
  protected right = new BehaviorSubject<ImageData | null>(null);

  // typescript please stop complaining
  public lastImages$ = combineLatest([
    this.left,
    this.right
  ]).pipe(
    map(([l, r]) => ImageLocalStorageService.leftAndRight(l, r)))


  constructor() { }

  private static leftAndRight(l: ImageData | null, r: ImageData | null): [ImageData, ImageData] | [null, null] {
    if(l === null || r === null) return [null, null]
    return [l, r]
  }

  private addImage(image: ImageData, which: 'left' | 'right'): Promise<boolean> {
    // Resolve false only when the image is not the same size as the other image
    const promise = new Promise<boolean>(resolve => {
      const left = this.left.getValue()
      const right = this.right.getValue()
      let canAdd = false;

      switch (which) {
        case 'left':
          canAdd = (right == null || (right.width == image.width && right.height == image.height))
          if(canAdd) this.left.next(image)
          break;
          
        case 'right':
          canAdd = (left == null || (left.width == image.width && left.height == image.height))
          if(canAdd) this.right.next(image)
          break;
      }
      resolve(canAdd)
    })
    return promise;
  }

  public addImageLeft(image: ImageData): Promise<boolean> {
    return this.addImage(image, "left")
  }

  public addImageRight(image: ImageData): Promise<boolean> {
    return this.addImage(image, "right")
  }

  public removeImageLeft() {
    this.left.next(null);
  }

  public removeImageRight() {
    this.right.next(null)
  }

}
