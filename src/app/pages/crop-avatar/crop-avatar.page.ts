import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-crop-avatar',
  templateUrl: './crop-avatar.page.html',
  styleUrls: ['./crop-avatar.page.scss'],
})
export class CropAvatarPage implements OnInit {

  constructor(private navCtrl:NavController) { }

  ngOnInit() {
  }
  onCropper(event:{msg:"cancel"|"ok";result:any}){
    if(event.msg=="cancel"){
      this.navCtrl.back();
    }else{
      this.uploadImage();
    }
  }
  uploadImage(){

  }

}
