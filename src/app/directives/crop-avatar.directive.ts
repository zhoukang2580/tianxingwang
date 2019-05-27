import { Directive, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AppHelper } from '../appHelper';
import { NavController } from '@ionic/angular';

@Directive({
  selector: '[cropAvatar]'
})
export class CropAvatarDirective {

  constructor(private navCtrl: NavController) {
  }
  @HostListener("click", ['$event'])
  onHostClick(evt: MouseEvent) {
    this.croppImage();
    evt.preventDefault();
    return false;
  }
  croppImage() {
    const fileEle = document.getElementById("file") as HTMLInputElement;
    if (fileEle) {
      fileEle.click();
      fileEle.onchange = (evt) => {
        const files = (evt.target as HTMLInputElement).files;
        const file = files[0];
        if (file) {
          const fr = new FileReader();
          fr.onload = () => {
            AppHelper.setRouteData(fr.result);
            this.navCtrl.navigateForward([AppHelper.getRoutePath('avatar-crop'),{'cropAvatar':"cropAvatar"}],{animated:false}).then(() => {
              fileEle.value = null;
            });
          }
          fr.readAsDataURL(file);
        }
      }
    }
  }
}
