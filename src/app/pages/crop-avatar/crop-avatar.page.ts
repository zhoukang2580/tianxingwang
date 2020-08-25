import {
  Component,
  OnInit,
  HostBinding,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { NavController, Platform, Config } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import Cropper from "cropperjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
@Component({
  selector: "app-crop-avatar",
  templateUrl: "./crop-avatar.page.html",
  styleUrls: ["./crop-avatar.page.scss"],
})
export class CropAvatarPage implements OnInit, AfterViewInit {
  cropper: Cropper;
  showCropBox = false;
  @HostBinding("class.backdrop") uploaded = false;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  resultImageUrl: string;
  isH5 = true || AppHelper.isH5();
  fileReader: FileReader;
  avatar: string;
  croppedImage: HTMLImageElement;
  method: string;
  fileName: string;
  constructor(
    private apiService: ApiService,
    private plt: Platform,
    private activatedRoute: ActivatedRoute
  ) {
    this.fileReader = new FileReader();
  }

  ngOnInit() {}
  goBack() {
    this.backbtn.popToPrePage();
  }
  ngAfterViewInit() {
    this.croppedImage = document.getElementById("image") as HTMLImageElement;
    this.activatedRoute.paramMap.subscribe((d) => {
      if (d && d.get("cropAvatar")) {
        this.method = d.get("method");
        this.fileName = d.get("fileName");
        const fileObj = AppHelper.getRouteData();
        // console.log("objectUrl=", fileObj);
        this.croppedImage.src = fileObj;
        // this.croppedImage.onload = _ => {
        //   window.URL=window.URL||window['webkitURL'];
        //   window.URL.revokeObjectURL(fileObj);
        // }
        if (this.croppedImage) {
          AppHelper.setRouteData(null);
          this.reset();
        } else {
          this.cancel();
        }
      }
    });
  }
  rotate() {
    if (this.cropper) {
      this.cropper.rotate(45);
    }
  }
  cancel() {
    // this.showCropBox = false;
    this.backbtn.popToPrePage();
  }

  ok() {
    setTimeout(() => {
      this.showCropBox = false;
    }, 0);
    const avatar = this.cropper.getCroppedCanvas({
      maxWidth: 400,
      maxHeight: 400,
      minWidth: 400,
      minHeight: 400,
      // fillColor: '#fff',
      imageSmoothingEnabled: false,
      // imageSmoothingQuality: 'medium' as any,
    });
    this.avatar = this.resultImageUrl = avatar.toDataURL("image/jpeg", 0.8);
    this.uploadImage(this.avatar);
    // avatar.toBlob(
    //   blob => {
    //     this.uploadImageBytes(blob);
    //   },
    //   "image/jpeg",
    //   0.8
    // );
  }
  reset() {
    if (this.cropper) {
      this.cropper.destroy();
    }
    this.initCropper();
    setTimeout(() => {
      this.showCropBox = true;
    }, 0);
  }
  uploadImageBytes(blob: Blob) {
    const formData = new FormData();
    formData.append("avatar", blob);
    const req = new RequestEntity();
    req.Method = this.method;
    req.Data = blob;
    this.uploadAction(req);
  }
  private uploadImage(avatarBase64Str: string) {
    const req = new RequestEntity();
    const vals = avatarBase64Str.split(",");
    req.Method = this.method;
    req.IsShowLoading = true;
    req.Data = {
      FileName: this.fileName,
    };
    req.FileValue = vals[1];
    this.uploadAction(req);
  }
  private uploadAction(req: RequestEntity) {
    const uploadSubscription = this.apiService
      // .getResponse(req, true, "image/jpeg", this.fileName)
      .getResponse(req)
      .subscribe(
        (uploadRes) => {
          this.showCropBox = false;
          this.uploaded = uploadRes.Status;
          if (uploadRes.Status) {
            AppHelper.setRouteData(true);
            this.goBack();
          } else if (uploadRes.Message) {
            AppHelper.alert(uploadRes.Message);
          }
        },
        (e) => {
          this.uploaded = false;
          this.showCropBox = true;
          AppHelper.alert(e);
        },
        () => {
          if (uploadSubscription) {
            setTimeout(() => {
              uploadSubscription.unsubscribe();
            }, 10);
          }
        }
      );
  }
  initCropper() {
    // ios设备的内存限制，最好在裁切前将图片缩小到1024px以内
    //  For example, if the original type is JPEG,
    // then use cropper.getCroppedCanvas().toDataURL('image/jpeg') to export image.
    this.cropper = new Cropper(this.croppedImage, {
      center: true,
      cropBoxMovable: false,
      cropBoxResizable: false,
      background: false,
      dragMode: "move" as any,
      minCanvasWidth: this.plt.width(),
      minCanvasHeight: this.plt.height(),
      minContainerHeight: this.plt.height(),
      minContainerWidth: this.plt.width(),
      minCropBoxWidth: this.plt.width() * 0.7,
      minCropBoxHeight: this.plt.width() * 0.7,
      responsive: true,
      // modal: true,
      aspectRatio: 1 / 1,
      // initialAspectRatio: Math.min(this.croppedImage.naturalHeight / this.plt.width(), this.croppedImage.naturalWidth / this.plt.width()),
      viewMode: 0,
      crop(event) {
        // console.log(event.detail.x);
        // console.log(event.detail.y);
        // console.log(event.detail.width);
        // console.log(event.detail.height);
        // console.log(event.detail.rotate);
        // console.log(event.detail.scaleX);
        // console.log(event.detail.scaleY);
      },
    });
  }
}
