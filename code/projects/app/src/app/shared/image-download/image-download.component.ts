import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AppImage } from "../../core/app-image";

@Component({
  selector: "app-image-download",
  standalone: true,
  imports: [],
  templateUrl: "./image-download.component.html",
  styleUrl: "./image-download.component.css",
})
export class ImageDownloadComponent implements OnInit {
  @Input({ required: true }) public image$!: Observable<AppImage>;

  protected path = "";

  public ngOnInit(): void {
    this.image$.subscribe((image) => (this.path = image.dataUrl));
  }
}
