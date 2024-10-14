import { Component } from "@angular/core";
import { map, Subject } from "rxjs";
import { ImageUploadComponent } from "../../shared/image-upload/image-upload.component";
import { ImageDisplayComponent } from "../../shared/image-display/image-display.component";
import { AppImage } from "../../core/app-image";
import { highlightLsb } from "../../core/lsb";

@Component({
  selector: "app-e1",
  standalone: true,
  imports: [ImageUploadComponent, ImageDisplayComponent],
  templateUrl: "./e1.component.html",
  styleUrl: "./e1.component.css",
})
export class E1Component {
  private readonly imageSubject = new Subject<AppImage>();
  protected readonly srcImage$ = this.imageSubject.asObservable();
  protected readonly lsbImage$ = this.srcImage$.pipe(map(highlightLsb));

  protected nextImage(image: AppImage): void {
    this.imageSubject.next(image);
  }
}
