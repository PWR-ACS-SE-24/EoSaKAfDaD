import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { map, Subject } from "rxjs";
import { vcIsMonochrome, vcMakeMask } from "steg";
import { ImageDisplayComponent } from "../../../shared/image-display/image-display.component";
import { ImageUploadComponent } from "../../../shared/image-upload/image-upload.component";

@Component({
  selector: "app-e4-merge",
  standalone: true,
  templateUrl: "./e4-merge.component.html",
  styleUrl: "./e4-merge.component.css",
  imports: [FormsModule, ImageUploadComponent, ImageDisplayComponent],
})
export class E4MergeComponent {
  private readonly leftSubject = new Subject<ImageData>();
  private readonly rightSubject = new Subject<ImageData>();

  protected readonly left$ = this.leftSubject
    .asObservable()
    .pipe(map(vcMakeMask));
  protected readonly right$ = this.rightSubject
    .asObservable()
    .pipe(map(vcMakeMask));

  protected readonly uploadValidators = [
    {
      validate: vcIsMonochrome,
      message: "Obraz musi być monochromatyczny!",
    },
  ];

  protected offset = 0;

  protected onLeftUpload(image: ImageData): void {
    this.leftSubject.next(image);
  }

  protected onRightUpload(image: ImageData): void {
    this.rightSubject.next(image);
  }
}
