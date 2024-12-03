import { AsyncPipe } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { DownloadPipe } from "./download.pipe";

@Component({
  selector: "app-file-download",
  standalone: true,
  imports: [AsyncPipe, DownloadPipe],
  templateUrl: "./file-download.component.html",
  styleUrl: "./file-download.component.css",
})
export class FileDownloadComponent {
  @Input({ required: true }) public file$!: Observable<File>;
}
