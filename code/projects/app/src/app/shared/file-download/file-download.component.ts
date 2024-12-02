import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";

type DownloadData = {
  fileName: string;
  path: string;
} | null;

@Component({
  selector: "app-file-download",
  standalone: true,
  imports: [],
  templateUrl: "./file-download.component.html",
  styleUrl: "./file-download.component.css",
})
export class FileDownloadComponent implements OnInit {
  @Input({ required: true }) public file$!: Observable<File>;

  protected data: DownloadData = null;

  public ngOnInit(): void {
    this.file$.subscribe((file) => {
      this.data = {
        path: URL.createObjectURL(file),
        fileName: file.name
      }
    });
  }
}
