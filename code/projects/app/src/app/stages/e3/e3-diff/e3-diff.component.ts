import { Component } from '@angular/core';
import { ImageLocalStorageService } from '../../../shared/image-local-storage/image-local-storage.service';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { toolDifference } from 'steg'
import { SliderComponent } from '../slider/slider.component';
import { ImageDisplayComponent } from '../../../shared/image-display/image-display.component';
import { ImageDownloadComponent } from '../../../shared/image-download/image-download.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-e3-diff',
  standalone: true,
  imports: [
    SliderComponent,
    ImageDisplayComponent,
    ImageDownloadComponent,
  ],
  templateUrl: './e3-diff.component.html',
  styleUrl: './e3-diff.component.css'
})
export class E3DiffComponent {

  protected readonly contrastSubject = new BehaviorSubject(0);
  protected readonly brighnessSubject = new BehaviorSubject(0);

  protected readonly image$: Observable<ImageData>;
  protected readonly left$: Observable<ImageData>;
  protected readonly right$: Observable<ImageData>;

  constructor(private readonly imageLocalStorage: ImageLocalStorageService) {
    this.left$ = this.imageLocalStorage.left$;
    this.right$ = this.imageLocalStorage.right$;

    this.image$ = combineLatest([
      this.contrastSubject,
      this.brighnessSubject,
      this.imageLocalStorage.lastImages$
    ]).pipe(map(([contrast, brightness, [left, right]]) => {
      return toolDifference(left, right, contrast, brightness);
    }))
  }

  protected clear() {
    this.imageLocalStorage.clear('left');
    this.imageLocalStorage.clear('right');
  }
}
