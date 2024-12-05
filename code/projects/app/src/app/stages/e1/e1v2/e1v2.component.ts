import { Component } from "@angular/core";
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
} from "rxjs";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../../shared/image-download/image-download.component";
import { lsbHighlight, lsb2extractText, lsb2embedText } from "steg";

@Component({
  selector: "app-e1v2",
  standalone: true,
  imports: [
    ImageUploadComponent,
    ImageDisplayComponent,
    ImageDownloadComponent,
  ],
  templateUrl: "./e1v2.component.html",
  styleUrl: "./e1v2.component.css",
})
export class E1V2Component {
  protected textContent = "";
  protected textBound = 0;
  private readonly textSubject = new Subject<string>();
  private readonly imageSubject = new Subject<ImageData>();
  protected readonly newImage$ = combineLatest([
    this.imageSubject,
    this.textSubject.pipe(debounceTime(100), distinctUntilChanged()),
  ]).pipe(map(([image, text]) => lsb2embedText(image, text)));
  protected readonly lsbImage$ = this.newImage$.pipe(map(lsbHighlight));

  protected onNextImage(image: ImageData): void {
    this.imageSubject.next(image);

    this.textContent = lsb2extractText(image);
    this.textSubject.next(this.textContent);
    this.textBound = Math.floor((image.width * image.height) / 2);
  }

  protected onTextChange(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;
    this.textContent = target.value.slice(0, this.textBound);
    target.value = this.textContent;
    this.textSubject.next(this.textContent);
  }
}
