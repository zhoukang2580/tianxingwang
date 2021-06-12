import { Component, OnInit } from "@angular/core";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { AppHelper } from "src/app/appHelper";
import { ImgControlComponent } from 'src/app/components/img-control/img-control.component';
import { ConfigService } from 'src/app/services/config/config.service';
import { ConfigEntity } from 'src/app/services/config/config.entity';

@Component({
  selector: "app-download-file",
  templateUrl: "./download-file.component.html",
  styleUrls: ["./download-file.component.scss"],
  providers: [FileOpener],
})
export class DownloadFileComponent implements OnInit {
  downloadItems: any[];
  config: ConfigEntity;
  constructor(private fileOpener: FileOpener, private configService: ConfigService) { }
  back() {
    AppHelper.modalController.getTop().then((m) => {
      if (m) {
        m.dismiss();
      }
    });
  }
  ngOnInit() {
    this.configService.getConfigAsync().then(c => {
      this.config = c;
    })
  }
  onOpenFile(f) {
    console.log("onOpenFile", f);
    if (f && f.filePath && f.isCompleted) {
      f.filePath = decodeURIComponent(f.filePath);
      if (this.isImage(f.url)) {
        this.openImage(f.url
        );
        return;
      }
      let ext = f.filePath.split(".").pop();
      try {
        if (!ext) {
          if (f.url) {
            ext = f.url.split("?")[0].split("/").pop().split(".").pop();
          }
        }
      } catch (e) {
        console.error(e);
      }
      this.fileOpener
        .showOpenWithDialog(f.filePath, this.getMimetypes(ext || f.filePath))
        .then((r) => {
          console.log("success", r);
        })
        .catch((e) => {
          console.error("onOpenFile ", e);
        });
    }
  }
  async openImage(src) {
    const m = await AppHelper.modalController.create({
      component: ImgControlComponent,
      componentProps: {
        imageUrls: [
          {
            imageUrl: src,
          },
        ],
        isViewImage: true,
        loadingImage: this.config && this.config.PrerenderImageUrl,
        defaultImage: this.config && this.config.DefaultImageUrl,
      },
    });
    m.present();
  }
  private isImage(url: string) {
    return /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)/i.test(url);
  }
  private getMimetypes(fileName: string) {
    if (fileName) {
      const ext = fileName.split(".").pop();
      console.log(`getmimetypes:fileName=${fileName},ext=${ext}`);
      if (ext == "jpg" || ext == "jpeg") {
        return "image/jpg";
      }
      if (ext == "pdf") {
        return "application/pdf";
      }
      if (ext == "mp4") {
        return "video/mp4";
      }
      if (ext == "wmv") {
        return "video/x-ms-wmv";
      }
      if (ext == "mov") {
        return "video/quicktime";
      }
      if (ext == "apk") {
        return "application/vnd.android.package-archive";
      }
      if (ext == "png") {
        return "image/png";
      }
      if (ext == "webp") {
        return "image/webp";
      }
      if (ext == "xls") {
        return "application/vnd.ms-excel";
      }
      if (ext == "doc") {
        return "application/msword";
      }
      if (ext == "docx") {
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }
      if (ext == "ppt") {
        return "application/vnd.ms-powerpoint";
      }
      if (ext == "pptx") {
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      }
      if (ext == "xlsx") {
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }
    }
    return "application/xhtml+xml";
  }
}
