import { Component } from "@angular/core";
import { map, share, Subject } from "rxjs";
import { vcIsMonochrome, vcSplit } from "steg";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";

@Component({
  selector: "app-e4-split",
  standalone: true,
  templateUrl: "./e4-split.component.html",
  styleUrl: "./e4-split.component.css",
  imports: [
    ImageUploadComponent,
    ImageDisplayComponent,
    ImageDownloadComponent,
  ],
})
export class E4SplitComponent {
  private readonly imageSubject = new Subject<ImageData>();
  protected readonly image$ = this.imageSubject.asObservable();
  protected readonly layers$ = this.image$.pipe(
    map((image) => vcSplit(image, Date.now())),
    share()
  );
  protected readonly left$ = this.layers$.pipe(map((l) => l[0]));
  protected readonly right$ = this.layers$.pipe(map((l) => l[1]));

  protected readonly uploadValidators = [
    {
      validate: vcIsMonochrome,
      message: "Obraz musi być monochromatyczny!",
    },
  ];

  protected onImageUpload(image: ImageData): void {
    this.imageSubject.next(image);
  }
}
