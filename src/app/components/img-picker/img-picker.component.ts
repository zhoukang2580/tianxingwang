import { OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform, ModalController } from '@ionic/angular';
import Cropper from "cropperjs";
@Component({
  selector: 'app-img-picker',
  templateUrl: './img-picker.component.html',
  styleUrls: ['./img-picker.component.scss'],
})
export class ImgPickerComponent implements OnInit, OnDestroy {
  @ViewChild('input', { static: true }) inputFile: ElementRef<HTMLInputElement>;
  private subscription = Subscription.EMPTY;
  private imgUrl = '';
  @ViewChild('image', { static: true }) private croppedImage: ElementRef<HTMLImageElement>;
  result: { name: string; fileValue: string; }
  cropper: Cropper;
  constructor(private plt: Platform, private modalCtrl: ModalController) { }
  ngOnDestroy() {

  }
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
    this.result = null;
    this.back()
  }
  back() {
    this.modalCtrl.getTop().then(t => {
      if (t) {
        t.dismiss(this.result)
      }
    })
  }
  ok() {
    const avatar = this.cropper.getCroppedCanvas({
      maxWidth: 800,
      maxHeight: 800,
      minWidth: 800,
      minHeight: 800,
      // fillColor: '#fff',
      imageSmoothingEnabled: false
      // imageSmoothingQuality: 'medium' as any,
    });
    this.result.fileValue = avatar.toDataURL("image/jpeg", 0.8);
    this.back();
  }
  reset() {
    if (this.cropper) {
      this.cropper.destroy();
    }
    this.initCropper();
  }
}
