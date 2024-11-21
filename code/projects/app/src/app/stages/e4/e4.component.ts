import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BehaviorSubject, combineLatest, map, Subject } from "rxjs";
import { ImageDisplayComponent } from "../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../shared/image-upload/image-upload.component";
import { ImageDownloadComponent } from "../../shared/image-download/image-download.component";

@Component({
  selector: "app-e4",
  standalone: true,
  imports: [
    CommonModule,
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
  protected readonly blurSubject = new BehaviorSubject(0);
  protected readonly contrastSubject = new BehaviorSubject(100);
  private readonly change$ = combineLatest([
    this.scaleSubject,
    this.noiseSubject,
    this.blurSubject,
    this.contrastSubject,
  ]).pipe(
    map(([scale, noise, blur, contrast]) => ({
      scale,
      noise,
      blur,
      contrast,
    }))
  );

  private readonly imageSubject = new Subject<ImageData>();
  protected readonly oldImage$ = this.imageSubject.asObservable();
  protected readonly newImage$ = combineLatest([
    this.oldImage$,
    this.change$,
  ]).pipe(map(([image, { scale, noise, blur, contrast }]) => image));

  protected int(text: string): number {
    return parseInt(text, 10);
  }

  protected onImageUpload(image: ImageData): void {
    this.imageSubject.next(image);
  }
}
