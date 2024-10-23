import { Component } from "@angular/core";
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
} from "rxjs";
import { ImageUploadComponent } from "../../shared/image-upload/image-upload.component";
import { ImageDisplayComponent } from "../../shared/image-display/image-display.component";
import { ImageDownloadComponent } from "../../shared/image-download/image-download.component";
import { AppImage, highlightLsb, embedText, extractText } from "steg";

@Component({
  selector: "app-e1",
  standalone: true,
  imports: [
    ImageUploadComponent,
    ImageDisplayComponent,
    ImageDownloadComponent,
  ],
  templateUrl: "./e1.component.html",
  styleUrl: "./e1.component.css",
})
export class E1Component {
  protected textContent = "";
  protected textBound = 0;
  private readonly textSubject = new Subject<string>();
  private readonly imageSubject = new Subject<AppImage>();
  protected readonly newImage$ = combineLatest([
    this.imageSubject,
    this.textSubject.pipe(debounceTime(100), distinctUntilChanged()),
  ]).pipe(map(([image, text]) => embedText(image, text)));
  protected readonly lsbImage$ = this.newImage$.pipe(map(highlightLsb));

  protected onNextImage(image: AppImage): void {
    this.imageSubject.next(image);

    this.textContent = extractText(image);
    this.textSubject.next(this.textContent);
    this.textBound = Math.floor(
      (image.imageData.width * image.imageData.height * 3) / 7
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
