import { AsyncPipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";

type DownloadData = {
  fileName: string;
  path: string;
};

@Component({
  selector: "app-file-download",
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: "./file-download.component.html",
  styleUrl: "./file-download.component.css",
})
export class FileDownloadComponent implements OnInit {
  @Input({ required: true }) public file$!: Observable<File>;

  private download = new Subject<DownloadData>();
  protected download$ = this.download.asObservable()

  ngOnInit(): void {
    this.file$.subscribe((file) => {
      this.download.next({fileName: file.name, path: URL.createObjectURL(file)})
    })
  }
}
