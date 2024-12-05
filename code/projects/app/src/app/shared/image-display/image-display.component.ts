import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { drawOn } from "../../util/image-data";

@Component({
  selector: "app-image-display",
  standalone: true,
  imports: [],
  templateUrl: "./image-display.component.html",
  styleUrl: "./image-display.component.css",
})
export class ImageDisplayComponent implements OnInit {
  @Input({ required: true }) public image$!: Observable<ImageData>;

  @ViewChild("canvas", { static: true })
  protected readonly canvas!: ElementRef<HTMLCanvasElement>;

  showControls = false;

  public ngOnInit(): void {
    this.image$.subscribe((image) => {
      drawOn(image, this.canvas.nativeElement)
      this.showControls = true;
    });
  }
}
