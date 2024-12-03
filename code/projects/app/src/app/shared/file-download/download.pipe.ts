import { Pipe, PipeTransform } from '@angular/core';
import { map, Observable } from 'rxjs';

type DownloadData = {
  fileName: string;
  path: string;
};

@Pipe({
  name: 'download',
  standalone: true
})
export class DownloadPipe implements PipeTransform {

  transform(file: Observable<File>, ..._: never[]): Observable<DownloadData> {
    return file.pipe(map(file => { return { fileName: file.name, path: URL.createObjectURL(file) } }))
  }
}
