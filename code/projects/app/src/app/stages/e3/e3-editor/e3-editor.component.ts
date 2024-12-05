import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { BehaviorSubject, combineLatestWith, map, share, Subject } from "rxjs";
import { toolBrightness, toolContrast, toolNoise, toolScale } from "steg";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { SliderComponent } from "./../slider/slider.component";

@Component({
  selector: "app-e3-editor",
  standalone: true,
  imports: [
    CommonModule,
    SliderComponent,
    ImageDisplayComponent,
    ImageUploadComponent,
    ImageDownloadComponent,
  ],
  templateUrl: "./e3-editor.component.html",
  styleUrl: "./e3-editor.component.css",
})
export class E3EditorComponent {
  protected readonly scaleSubject = new BehaviorSubject(100);
  protected readonly noiseSubject = new BehaviorSubject(0);
  protected readonly brighnessSubject = new BehaviorSubject(0);
  protected readonly contrastSubject = new BehaviorSubject(0);

  private readonly imageSubject = new Subject<ImageData>();
  protected readonly oldImage$ = this.imageSubject.asObservable();
  protected readonly newImage$ = this.oldImage$.pipe(
    combineLatestWith(this.scaleSubject),
    map(([i, scale]) => toolScale(i, scale)),
    combineLatestWith(this.noiseSubject),
    map(([i, noise]) => toolNoise(i, noise, Date.now())),
    combineLatestWith(this.brighnessSubject),
    map(([i, brightness]) => toolBrightness(i, brightness)),
    combineLatestWith(this.contrastSubject),
    map(([i, contrast]) => toolContrast(i, contrast)),
    share(),
  );

  protected dimensions(image: ImageData | null): string | null {
    if (!image) return null;
    return `${image.width} x ${image.height}`;
  }

  protected onImageUpload(image: ImageData): void {
    this.imageSubject.next(image);
  }
}
