import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AppHelper } from 'src/app/appHelper';
import Cropper from 'cropperjs';

@Component({
  selector: 'app-crop-avatar',
  templateUrl: './crop-avatar.page.html',
  styleUrls: ['./crop-avatar.page.scss'],
})
export class CropAvatarPage implements OnInit {
  cropper: Cropper;
  showCropBox = false;
  resultImageUrl: string;
  isH5 = true || AppHelper.isH5();
  inputFileEle: HTMLInputElement;
  fileReader: FileReader;
  avatar: string;
  croppedImage: HTMLImageElement;
  constructor(private navCtrl: NavController, private plt: Platform, private ngZone: NgZone) {
    this.fileReader = new FileReader();
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.croppedImage = document.getElementById('image') as HTMLImageElement;
    this.initCropper();
    this.inputFileEle = document.getElementById("file") as HTMLInputElement;
    this.inputFileEle.click();
    if (this.inputFileEle) {
      this.inputFileEle.onchange = (evt) => {
        const files: FileList = evt.target['files'];
        const file = files[0];
        this.fileReader.readAsDataURL(file);
        this.fileReader.onload = () => {
          this.croppedImage.src = this.fileReader.result as string;
          this.showCropBox = true;
          this.reset();
        }
      }
    }
    this.startCropImage();
  }
  rotate() {
    if (this.cropper) {
      this.cropper.rotate(45);
    }
  }
  cancel() {
    // this.showCropBox = false;
    this.navCtrl.back();
  }
  startCropImage() {
    if (this.isH5) {
      if (this.inputFileEle) {
        document.getElementById("button").click();
      }
    }
  }
  ok() {
    this.showCropBox = false;
    this.avatar = this.resultImageUrl = this.cropper.getCroppedCanvas({
      maxWidth: 800,
      maxHeight: 800
    }).toDataURL();
  }
  reset() {
    if (this.cropper) {
      this.cropper.destroy();
      this.initCropper();
      this.showCropBox = true;
    }
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
      aspectRatio: 4 / 3,
      viewMode: 2,
      initialAspectRatio: 3,
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
