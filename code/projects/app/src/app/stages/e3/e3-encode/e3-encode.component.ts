import { Component } from "@angular/core";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";
import { SliderComponent } from "../../e4/slider/slider.component";
import { Subject, BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, from, switchMap } from "rxjs";
import { JPEGEncoder } from "../helpers/jpeg-encode";
import { fromFile } from "../../../util/image-data";
import { FileDownloadComponent } from "../../../shared/file-download/file-download.component";

@Component({
  selector: "app-e3-encode",
  standalone: true,
  imports: [
    ImageDisplayComponent,
    ImageUploadComponent,
    SliderComponent,
    FileDownloadComponent
],
  templateUrl: "./e3-encode.component.html",
  styleUrl: "./e3-encode.component.css",
})
export class E3EncodeComponent {
  protected readonly textEncoder = new TextEncoder()

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

  protected readonly qualitySubject = new BehaviorSubject(100);
  protected readonly dataDensitySubject = new BehaviorSubject(1);

  protected readonly newFile = new Subject<File>();
  protected readonly newImage = combineLatest([
    this.imageSubject,
    this.qualitySubject,
    this.dataDensitySubject,
    this.textSubject.pipe(debounceTime(300), distinctUntilChanged()),
  ]).pipe(
    switchMap(([image, quality, dataDensity, text]) => this.encodeImage(text, quality, dataDensity, image)),
  );

  protected onImageChange(imageData: ImageData): void {
    this.textBound = Math.floor((imageData.height * imageData.width) / 64) * 2 * this.dataDensitySubject.value;
    this.imageSubject.next(imageData);
  }

  protected encodeImage(text: string, quality: number, dataDensity: number, data: ImageData) {
    const encoder = new JPEGEncoder(quality);
    const encodedText = Array.from(this.textEncoder.encode(text)).flatMap(v => 
      Array.from(v.toString(2).padStart(8, '0'))).map(b => parseInt(b)
    )

    const encodedImage = encoder.encode(data, { embedSize: dataDensity, secret: encodedText });
    const file = new File([encodedImage], `${Date.now()}.jpg`, {type: "image/jpeg"});
    this.newFile.next(file)
    
    return from(fromFile(file))
  }

  protected onTextChange(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;
    target.value = target.value.slice(0, this.textBound);
    this.textSubject.next(target.value);
  }
}
