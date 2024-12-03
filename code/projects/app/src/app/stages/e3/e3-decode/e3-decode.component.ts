import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Subject, switchMap } from 'rxjs';
import { JPEGDecoder } from '../helpers/jpeg-decode';
import { ImageDisplayComponent } from '../../../shared/image-display/image-display.component';
import { ImageUploadComponent } from '../../../shared/image-upload/image-upload.component';
import { SliderComponent } from '../../e4/slider/slider.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-e3-decode',
  standalone: true,
  imports: [
    ImageDisplayComponent,
    ImageUploadComponent,
    SliderComponent,
    AsyncPipe
  ],
  templateUrl: './e3-decode.component.html',
  styleUrl: './e3-decode.component.css'
})
export class E3DecodeComponent {
  protected readonly textDecoder = new TextDecoder()

  protected readonly dataDensitySubject = new BehaviorSubject(1);
  protected readonly imageSubject = new Subject<ImageData>(); 
  protected readonly fileSubject = new Subject<File>();
  protected readonly textSubject = combineLatest([
    this.dataDensitySubject,
    this.fileSubject.pipe(
      map((file) => file.arrayBuffer()),
      switchMap(result => result),
      map((buffer) => this.decodeImage(buffer))
    ),
  ]).pipe(
    map(([dataDensity, decoder]) => this.decodeTextFromDCT(decoder, dataDensity))
  )

  protected decodeImage(file: ArrayBuffer) {
    const rawImage = new Uint8ClampedArray(file);
    const decoder = new JPEGDecoder(rawImage)
    decoder.parse()
    return decoder
  }

  protected onImageChange(image: ImageData) {
    this.imageSubject.next(image)
  }

  protected decodeTextFromDCT(decoder: JPEGDecoder, dataDensity: number): string {
    const data = Array.from(decoder.getDCTEmbeddedData(dataDensity))
    const characters = new Uint8Array(Math.ceil(data.length / 8))
    for(let i = 0; i < Math.ceil(data.length / 8); i += 1) {
      characters[i] = data.slice(i * 8, (i + 1) * 8).reduce((acc, bit) => acc * 2 + bit, 0)
    }
    
    return this.textDecoder.decode(characters)
  }
}
