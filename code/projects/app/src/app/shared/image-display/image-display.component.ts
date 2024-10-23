import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { AppImage } from "steg";
import { drawOn } from "../../util/app-image";

@Component({
  selector: "app-image-display",
  standalone: true,
  imports: [],
  templateUrl: "./image-display.component.html",
  styleUrl: "./image-display.component.css",
})
export class ImageDisplayComponent implements OnInit {
  @Input({ required: true }) public image$!: Observable<AppImage>;

  @ViewChild("canvas", { static: true })
  protected readonly canvas!: ElementRef<HTMLCanvasElement>;

  public ngOnInit(): void {
    this.image$.subscribe((image) => drawOn(image, this.canvas.nativeElement));
  }
}
