import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { dataUrl } from "../../util/image-data";

@Component({
  selector: "app-image-download",
  standalone: true,
  imports: [],
  templateUrl: "./image-download.component.html",
  styleUrl: "./image-download.component.css",
})
export class ImageDownloadComponent implements OnInit {
  @Input({ required: true }) public image$!: Observable<ImageData>;

  protected path = "";

  public ngOnInit(): void {
    this.image$.subscribe((image) => (this.path = dataUrl(image)));
  }
}
