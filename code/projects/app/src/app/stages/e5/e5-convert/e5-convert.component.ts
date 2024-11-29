import { Component } from "@angular/core";
import { map, Subject } from "rxjs";
import { vcMakeMonochrome } from "steg";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";

@Component({
  selector: "app-e5-convert",
  standalone: true,
  templateUrl: "./e5-convert.component.html",
  styleUrl: "./e5-convert.component.css",
  imports: [
    ImageDisplayComponent,
    ImageUploadComponent,
    ImageDownloadComponent,
  ],
})
export class E5ConvertComponent {
  private readonly imageSubject = new Subject<ImageData>();
  protected readonly oldImage$ = this.imageSubject.asObservable();
  protected readonly newImage$ = this.oldImage$.pipe(
    map((image) => vcMakeMonochrome(image, "average", "random"))
  );

  protected onImageUpload(image: ImageData): void {
    this.imageSubject.next(image);
  }
}
