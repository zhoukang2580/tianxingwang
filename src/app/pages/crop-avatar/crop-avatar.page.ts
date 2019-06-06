import { Component, OnInit,HostBinding } from '@angular/core';
import { NavController, Platform, Config } from '@ionic/angular';
import { AppHelper } from 'src/app/appHelper';
import Cropper from 'cropperjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { RequestEntity } from 'src/app/services/api/Request.entity';
@Component({
  selector: 'app-crop-avatar',
  templateUrl: './crop-avatar.page.html',
  styleUrls: ['./crop-avatar.page.scss'],
})
export class CropAvatarPage implements OnInit {
  cropper: Cropper;
  showCropBox = false;
  @HostBinding("class.backdrop")
  uploaded=false;
  resultImageUrl: string;
  isH5 = true || AppHelper.isH5();
  fileReader: FileReader;
  avatar: string;
  croppedImage: HTMLImageElement;
  method:string;
  fileName:string;
  public static UploadSuccessEvent:string="CropAvatarPage.UploadSuccessEvent";
  constructor(private navCtrl: NavController, 
    private apiService:ApiService,
    private plt: Platform, private activatedRoute: ActivatedRoute) {
    this.fileReader = new FileReader();
  }

  ngOnInit() {

  }
  goBack(){
    this.navCtrl.back();
  }
  ngAfterViewInit() {
    this.croppedImage = document.getElementById('image') as HTMLImageElement;
    this.activatedRoute.paramMap.subscribe(d=>{
      if(d&&d.get('cropAvatar')){
        this.method=d.get("method");
        this.fileName=d.get("fileName");
        this.croppedImage.src=AppHelper.getRouteData();
        if(this.croppedImage){
          AppHelper.setRouteData(null);
          this.reset();
        }else{
          this.navCtrl.back();
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
    this.navCtrl.back();
  }

  ok() {
    setTimeout(() => {
      this.showCropBox = false;
    }, 0);
    this.avatar = this.resultImageUrl = this.cropper.getCroppedCanvas({
      maxWidth: 800,
      maxHeight: 800,
      minWidth:800,
      minHeight:800,
    }).toDataURL();
    this.uploadImage(this.avatar);

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
  uploadImage(avatarBase64Str:string){
    const req = new RequestEntity();
    const vals=avatarBase64Str.split(',');
    req.Method=this.method;
    req.IsShowLoading=true;
    req.Data={
      FileName:this.fileName
    }
    req.FileValue=encodeURIComponent(vals[1]);
   const uploadSubscription= this.apiService.getResponse<any>(req).subscribe(uploadRes=>{
      this.uploaded=true;
      this.showCropBox = false;
      if(uploadRes.Status)
      {
        AppHelper.executeCallback(CropAvatarPage.UploadSuccessEvent,uploadRes.Data);
        this.goBack();
      }
    },e=>{
      this.uploaded=false;
      this.showCropBox = true;
      AppHelper.alert(e);
    },()=>{
      if(uploadSubscription){
        setTimeout(() => {
          uploadSubscription.unsubscribe();
        }, 10);
      }
    });
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
      minCropBoxWidth: this.plt.width(),
      minCanvasHeight: this.plt.height(),
      minContainerHeight: this.plt.height(),
      minContainerWidth: this.plt.width(),
      responsive:true,
      aspectRatio: 1 / 1,
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
