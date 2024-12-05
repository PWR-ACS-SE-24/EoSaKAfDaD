import { Component, input } from "@angular/core";
import { computedOpt } from "../../util/computed-opt";

@Component({
  selector: "app-file-download",
  templateUrl: "./file-download.component.html",
  styleUrl: "./file-download.component.css",
})
export class FileDownloadComponent {
  public readonly file = input<File>();
  protected readonly download = computedOpt(this.file, (f) => ({
    fileName: f.name,
    path: URL.createObjectURL(f),
  }));
}
