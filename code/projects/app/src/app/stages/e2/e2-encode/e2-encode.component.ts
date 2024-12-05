import { Component, signal } from "@angular/core";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { SliderComponent } from "../../e3/slider/slider.component";
import {
  Subject,
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  from,
  switchMap,
} from "rxjs";
import { JPEGEncoder } from "../helpers/jpeg-encode";
import { fromFile } from "../../../util/image-data";
import { FileDownloadComponent } from "../../../shared/file-download/file-download.component";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";

@Component({
    selector: "app-e2-encode",
    imports: [
        ImageDisplayComponent,
        ImageUploadComponent,
        SliderComponent,
        FileDownloadComponent,
    ],
    templateUrl: "./e2-encode.component.html",
    styleUrl: "./e2-encode.component.css"
})
export class E2EncodeComponent {
  protected readonly textEncoder = new TextEncoder();

  // The problem with length of encoded text is that we can't know for sure how
  //   many characters we can encode in the image. The number of characters
  //   depends not only on the image size, but also on the image content,
  //   jpeg quality and the chosen data density. We can get the exact amount
  //   of characters that can be encoded only after the image is encoded.
  // We can calculate upper bound as follows:
  //   floor((height * width) / 64) * 2 * dataDensity
  protected textBound = 0;
  protected textContent = "";

  protected readonly imageSubject = new Subject<ImageData>();
  protected readonly textSubject = new BehaviorSubject("");

  protected readonly quality = signal(100);
  protected readonly dataDensity = signal(1);

  protected readonly quality$ = toObservable(this.quality);
  protected readonly dataDensity$ = toObservable(this.dataDensity);
  protected readonly image = toSignal(this.imageSubject);

  protected readonly newFile$ = new Subject<File>();
  protected readonly newImage$ = combineLatest([
    this.imageSubject,
    this.quality$,
    this.dataDensity$,
    this.textSubject.pipe(debounceTime(300), distinctUntilChanged()),
  ]).pipe(
    switchMap(([image, quality, dataDensity, text]) =>
      this.encodeImage(text, quality, dataDensity, image)
    )
  );

  protected readonly newImage = toSignal(this.newImage$);

  protected onImageChange(imageData: ImageData): void {
    this.textBound =
      Math.floor((imageData.height * imageData.width) / 64) *
      2 *
      this.dataDensity();
    this.imageSubject.next(imageData);
  }

  protected encodeImage(
    text: string,
    quality: number,
    dataDensity: number,
    data: ImageData
  ) {
    const encoder = new JPEGEncoder(quality);
    const encodedText = Array.from(this.textEncoder.encode(text))
      .flatMap((v) => Array.from(v.toString(2).padStart(8, "0")))
      .map((b) => parseInt(b));

    const encodedImage = encoder.encode(data, {
      embedSize: dataDensity,
      secret: encodedText,
    });
    const file = new File([encodedImage], `${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    this.newFile$.next(file);

    return from(fromFile(file));
  }

  protected onTextChange(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;
    target.value = target.value.slice(0, this.textBound);
    this.textSubject.next(target.value);
  }
}
