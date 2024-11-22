import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BehaviorSubject, combineLatest, map, Subject } from "rxjs";
import { ImageDisplayComponent } from "../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../shared/image-upload/image-upload.component";
import { ImageDownloadComponent } from "../../shared/image-download/image-download.component";
import { SliderComponent } from "./slider/slider.component";
import { toolScale, toolNoise, toolBrightness, toolContrast } from "steg";

@Component({
  selector: "app-e4",
  standalone: true,
  imports: [
    CommonModule,
    SliderComponent,
    ImageDisplayComponent,
    ImageUploadComponent,
    ImageDownloadComponent,
  ],
  templateUrl: "./e4.component.html",
  styleUrl: "./e4.component.css",
})
export class E4Component {
  protected readonly scaleSubject = new BehaviorSubject(100);
  protected readonly noiseSubject = new BehaviorSubject(0);
  protected readonly brighnessSubject = new BehaviorSubject(0);
  protected readonly contrastSubject = new BehaviorSubject(0);
  private readonly change$ = combineLatest([
    this.scaleSubject,
    this.noiseSubject,
    this.brighnessSubject,
    this.contrastSubject,
  ]).pipe(
    map(([scale, noise, brightness, contrast]) => ({
      scale,
      noise,
      brightness,
      contrast,
    }))
  );

  private readonly imageSubject = new Subject<ImageData>();
  protected readonly oldImage$ = this.imageSubject.asObservable();
  protected readonly newImage$ = combineLatest([
    this.oldImage$,
    this.change$,
  ]).pipe(
    map(([image, { scale, noise, brightness, contrast }]) =>
      toolContrast(
        toolBrightness(toolNoise(toolScale(image, scale), noise), brightness),
        contrast
      )
    )
  );

  protected dimensions(image: ImageData | null): string | null {
    if (!image) return null;
    return `${image.width} x ${image.height}`;
  }

  protected onImageUpload(image: ImageData): void {
    this.imageSubject.next(image);
  }
}
