import { Component, OnInit, AfterViewInit, EventEmitter, Input ,HostBinding} from '@angular/core';
import Cropper from 'cropperjs';
import { AppHelper } from 'src/app/appHelper';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'app-crop-image-comp',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss'],
})
export class CropImageComponent implements OnInit, AfterViewInit {
  @Input()
  avatar: string;
  cropper: Cropper;
  showCropBox = false;
  resultImageUrl: string;
  croppedEvent: EventEmitter<any>;
  isH5 = AppHelper.isH5();
  inputFileEle: HTMLInputElement;
  fileReader: FileReader;
  constructor(private plt:Platform) {
    this.croppedEvent = new EventEmitter();
    this.fileReader = new FileReader();
  }

  ngOnInit() { }
  ngAfterViewInit() {
    // ios设备的内存限制，最好在裁切前将图片缩小到1024px以内
    //  For example, if the original type is JPEG, 
    // then use cropper.getCroppedCanvas().toDataURL('image/jpeg') to export image.
    const image = document.getElementById('image') as HTMLImageElement;
    this.cropper = new Cropper(image, {
      center: true,
      cropBoxMovable: false,
      cropBoxResizable: false,
      background:false,
      dragMode: "move" as any,
      minCanvasWidth: this.plt.width(),
      minCanvasHeight: this.plt.height(),
      minContainerHeight: this.plt.height(),
      minContainerWidth: this.plt.width(),
      aspectRatio: 4 / 3,
      viewMode: 2,
      initialAspectRatio:3,
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
    this.inputFileEle = document.getElementById("file") as HTMLInputElement;
    if (this.inputFileEle) {
      this.inputFileEle.onchange = (evt) => {
        const files: FileList = evt.target['files'];
        const file = files[0];
        this.fileReader.readAsDataURL(file);
        this.fileReader.onload = () => {
          image.src = this.fileReader.result as string;
          this.showCropBox = true;
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
    this.croppedEvent.emit({
      msg:"cancel",
      result:""
    });
  }
  startCropImage() {
    if (this.isH5) {
      if (this.inputFileEle) {
        this.inputFileEle.click();
      }
    }
  }
  ok() {
    this.showCropBox = false;
    this.avatar = this.resultImageUrl = this.cropper.getCroppedCanvas({
      maxWidth: 800,
      maxHeight: 800
    }).toDataURL();
    this.croppedEvent.emit({
      msg:"ok",
      result:this.resultImageUrl
    });
  }
  reset() {
    this.cropper.reset();
    this.showCropBox = true;
  }
}
