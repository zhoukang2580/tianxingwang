import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef
} from "@angular/core";
import { ModalController, Platform } from "@ionic/angular";
import Cropper from "cropperjs";
import { Subscription, fromEvent } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { WebView } from "@ionic-native/ionic-webview/ngx";
@Component({
  selector: "app-upload-file",
  templateUrl: "./upload-file.component.html",
  styleUrls: ["./upload-file.component.scss"]
})
export class UploadFileComponent implements OnInit, OnDestroy {
  private result: { FileName: string; FileValue: string } = {} as any;
  private cropper: Cropper;
  private subscriptions: Subscription[] = [];
  @ViewChild("image", { static: true }) private croppedImage: ElementRef<
    HTMLImageElement
  >;
  showCropBox = false;
  constructor(
    private modalCtrl: ModalController,
    private plt: Platform,
    private webView: WebView
  ) {}
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngOnInit() {
    this.subscriptions.push(
      fromEvent(this.croppedImage.nativeElement, "load", {
        passive: true
      }).subscribe(() => {
        this.reset();
      })
    );
    const fInput: HTMLInputElement = document.getElementById("file") as any;
    if (fInput) {
      const subscription = fromEvent(fInput, "change", {
        passive: true
      }).subscribe(() => {
        const files = fInput.files;
        if (files && files.length) {
          const file = files[0];
          this.result.FileName = file.name;
          if (AppHelper.isApp()) {
            window.URL = window.URL || window["webkitURL"];
            const objectURL = window.URL.createObjectURL(file);
            this.croppedImage.nativeElement.src = this.webView.convertFileSrc(
              objectURL
            );
            setTimeout(() => {
              fInput.value = null;
            }, 0);
          } else {
            const fr = new FileReader();
            fr.onload = () => {
              this.croppedImage.nativeElement.src = fr.result as string;
              setTimeout(() => {
                fInput.value = null;
              }, 0);
            };
            fr.readAsDataURL(file);
          }
        }
      });
      this.subscriptions.push(subscription);
    }
  }
  onSelect() {
    const fInput: HTMLInputElement = document.getElementById("file") as any;
    fInput.click();
  }
  onConfirm() {
    setTimeout(() => {
      this.showCropBox = false;
    }, 0);
    const avatar = this.cropper.getCroppedCanvas({
      maxWidth: 600,
      maxHeight: 600,
      minWidth: 600,
      minHeight: 600,
      // fillColor: '#fff',
      imageSmoothingEnabled: true
      // imageSmoothingQuality: 'medium' as any,
    });
    this.result.FileValue = avatar.toDataURL("image/jpeg", 0.8);
    this.back();
  }
  onCancel() {
    this.back();
  }
  onRotate() {
    if (this.cropper) {
      this.cropper.rotate(45);
    }
  }
  private reset() {
    if (this.cropper) {
      this.cropper.destroy();
    }
    this.initCropper();
    setTimeout(() => {
      this.showCropBox = true;
    }, 0);
  }
  private back() {
    if (this.result && this.result.FileName) {
      this.result.FileName =
        this.result.FileName.substr(0, this.result.FileName.lastIndexOf(".")) +
        "." +
        "jpg";
    }
    this.modalCtrl.dismiss(this.result);
  }
  private initCropper() {
    // ios设备的内存限制，最好在裁切前将图片缩小到1024px以内
    //  For example, if the original type is JPEG,
    // then use cropper.getCroppedCanvas().toDataURL('image/jpeg') to export image.
    this.cropper = new Cropper(this.croppedImage.nativeElement, {
      center: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      background: false,
      dragMode: "move" as any,
      minCanvasWidth: this.plt.width(),
      minCanvasHeight: this.plt.height(),
      minContainerHeight: this.plt.height(),
      minContainerWidth: this.plt.width(),
      minCropBoxWidth: this.plt.width(),
      minCropBoxHeight: this.plt.width(),
      responsive: true,
      // modal: true,
      // aspectRatio: 1 / 1,
      viewMode: 0,
      crop(event) {
        // console.log(event.detail.x);
        // console.log(event.detail.y);
        // console.log(event.detail.width);
        // console.log(event.detail.height);
        // console.log(event.detail.rotate);
        // console.log(event.detail.scaleX);
        // console.log(event.detail.scaleY);
      }
    });
  }
}
