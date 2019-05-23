import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from "@ionic-native/file/ngx";
@Injectable({
  providedIn: 'root'
})
export class FileHelperService {

  constructor(private file: File,private httpClient:HttpClient) { }
  downloadFile(url: string, destPath: string) {

  }
}
