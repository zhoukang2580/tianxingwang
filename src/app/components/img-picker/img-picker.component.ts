import { OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { Platform, ModalController } from "@ionic/angular";
import Cropper from "cropperjs";
@Component({
  selector: "app-img-picker",
  templateUrl: "./img-picker.component.html",
  styleUrls: ["./img-picker.component.scss"],
})
export class ImgPickerComponent implements OnInit, OnDestroy {
  @ViewChild("input", { static: true }) inputFile: ElementRef<HTMLInputElement>;
  private subscription = Subscription.EMPTY;
  private imgUrl = "";
  private minCropBoxWidthPercent = 0.7;
  private cropperOptions: any;
  @ViewChild("image", { static: true })
  private croppedImage: ElementRef<HTMLImageElement>;
  result: { name: string; fileValue: string; imageUrl: string };
  cropper: Cropper;
  constructor(private plt: Platform, private modalCtrl: ModalController) {}
  ngOnDestroy() {}
  ngOnInit() {
    this.result = {} as any;
    this.croppedImage.nativeElement.src = this.imgUrl;
    this.reset();
  }
  initCropper() {
    // ios设备的内存限制，最好在裁切前将图片缩小到1024px以内
    //  For example, if the original type is JPEG,
    // then use cropper.getCroppedCanvas().toDataURL('image/jpeg') to export image.
    this.cropper = new Cropper(this.croppedImage.nativeElement, {
      center: true,
      cropBoxMovable: false,
      cropBoxResizable: false,
      background: false,
      // dragMode: "move" as any,
      minCanvasWidth: this.plt.width(),
      minCanvasHeight: this.plt.height(),
      minContainerHeight: this.plt.height(),
      minContainerWidth: this.plt.width(),
      minCropBoxWidth: this.plt.width() * 0.9,
      minCropBoxHeight: this.plt.width() * 0.9,
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
      },
      ...this.cropperOptions,
    });
  }
  rotate() {
    if (this.cropper) {
      this.cropper.rotate(45);
    }
  }
  cancel() {
    // this.showCropBox = false;
    this.result = null;
    this.back();
  }
  back() {
    this.modalCtrl.getTop().then((t) => {
      if (t) {
        t.dismiss(this.result);
      }
    });
  }
  ok() {
    let opts: any = {};
    if (this.cropperOptions) {
      if (this.cropperOptions.maxWidth) {
        opts.maxWidth = this.cropperOptions.maxWidth;
      }
      if (this.cropperOptions.maxHeight) {
        opts.maxHeight = this.cropperOptions.maxHeight;
      }
      if (this.cropperOptions.minWidth) {
        opts.minWidth = this.cropperOptions.minWidth;
      }
      if (this.cropperOptions.minHeight) {
        opts.minHeight = this.cropperOptions.minHeight;
      }
      if (this.cropperOptions.fillColor) {
        opts.fillColor = this.cropperOptions.fillColor;
      }
      if (this.cropperOptions.imageSmoothingEnabled) {
        opts.imageSmoothingEnabled = this.cropperOptions.imageSmoothingEnabled;
      }
      if (this.cropperOptions.imageSmoothingQuality) {
        opts.imageSmoothingQuality = this.cropperOptions.imageSmoothingQuality;
      }
    }
    const avatar = this.cropper.getCroppedCanvas(opts);
    this.result.fileValue = avatar.toDataURL("image/jpeg", 0.8);
    this.result.imageUrl = this.result.fileValue;
    this.back();
  }
  reset() {
    if (this.cropper) {
      this.cropper.destroy();
    }
    this.initCropper();
  }
}
