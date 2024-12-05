import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { BehaviorSubject, combineLatestWith, map, Subject } from "rxjs";
import { vcMakeMonochrome } from "steg";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";

@Component({
  selector: "app-e4-convert",
  standalone: true,
  templateUrl: "./e4-convert.component.html",
  styleUrl: "./e4-convert.component.css",
  imports: [
    CommonModule,
    ImageDisplayComponent,
    ImageUploadComponent,
    ImageDownloadComponent,
  ],
})
export class E4ConvertComponent {
  protected readonly grayscaleSubject = new BehaviorSubject("luminosity");
  protected readonly ditheringSubject = new BehaviorSubject("floyd-steinberg");

  private readonly imageSubject = new Subject<ImageData>();
  protected readonly oldImage$ = this.imageSubject.asObservable();
  protected readonly newImage$ = this.oldImage$.pipe(
    combineLatestWith(this.grayscaleSubject, this.ditheringSubject),
    map(([image, grayscale, dithering]) =>
      vcMakeMonochrome(image, grayscale, dithering),
    ),
  );

  protected onImageUpload(image: ImageData): void {
    this.imageSubject.next(image);
  }
}
