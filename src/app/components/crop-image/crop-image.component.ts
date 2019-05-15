import { Component, OnInit, AfterViewInit } from '@angular/core';
import Cropper from 'cropperjs';
@Component({
  selector: 'app-crop-image-comp',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss'],
})
export class CropImageComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() { }
  ngAfterViewInit() {
    // ios设备的内存限制，最好在裁切前将图片缩小到1024px以内
    //  For example, if the original type is JPEG, 
    // then use cropper.getCroppedCanvas().toDataURL('image/jpeg') to export image.
    const image = document.getElementById('image') as HTMLImageElement;
    const cropper = new Cropper(image, {
      center: true,
      cropBoxMovable: false,
      cropBoxResizable: false,
      dragMode: "move" as any,
      aspectRatio: 16 / 9,
      crop(event) {
        // console.log(event.detail.x);
        // console.log(event.detail.y);
        // console.log(event.detail.width);
        // console.log(event.detail.height);
        // console.log(event.detail.rotate);
        // console.log(event.detail.scaleX);
        // console.log(event.detail.scaleY);
      },
      cropend:evt=>{
        console.log("cropend evt",evt);
      }
    });
  }
}
