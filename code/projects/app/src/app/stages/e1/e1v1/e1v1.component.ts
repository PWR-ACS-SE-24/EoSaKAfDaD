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
import { lsbHighlight, lsb1embedText, lsb1extractText } from "steg";
import { toSignal } from "@angular/core/rxjs-interop";

const ASCII_CHAR_BITS = 7;
const RGB_CHANNELS = 3;

@Component({
  selector: "app-e1v1",
  standalone: true,
  imports: [
    ImageUploadComponent,
    ImageDisplayComponent,
    ImageDownloadComponent,
  ],
  templateUrl: "./e1v1.component.html",
  styleUrl: "./e1v1.component.css",
})
export class E1V1Component {
  protected textContent = "";
  protected textBound = 0;
  private readonly textSubject = new Subject<string>();
  private readonly imageSubject = new Subject<ImageData>();
  protected readonly newImage$ = combineLatest([
    this.imageSubject,
    this.textSubject.pipe(debounceTime(100), distinctUntilChanged()),
  ]).pipe(map(([image, text]) => lsb1embedText(image, text)));
  protected readonly lsbImage$ = this.newImage$.pipe(map(lsbHighlight));

  protected readonly newImage = toSignal(this.newImage$);
  protected readonly lsbImage = toSignal(this.lsbImage$);

  protected onNextImage(image: ImageData): void {
    this.imageSubject.next(image);

    this.textContent = lsb1extractText(image);
    this.textSubject.next(this.textContent);
    this.textBound = Math.floor(
      (image.width * image.height * RGB_CHANNELS) / ASCII_CHAR_BITS
    );
  }

  protected onTextChange(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;
    this.textContent = target.value
      .replace(/[^\x00-\x7F]/g, "")
      .slice(0, this.textBound);
    target.value = this.textContent;
    this.textSubject.next(this.textContent);
  }
}
