import { WebView } from "@ionic-native/ionic-webview/ngx";
import { Directive, HostListener, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { AppHelper } from "../appHelper";
import { NavController } from "@ionic/angular";

@Directive({
  selector: "[cropAvatar]",
})
export class CropAvatarDirective {
  constructor(
    private navCtrl: NavController,
    private sender: ElementRef,
    private webView: WebView,
    private router: Router
  ) {
    console.dir(sender);
  }
  @HostListener("click", ["$event"])
  onHostClick(evt: MouseEvent) {
    this.croppImage();
    evt.preventDefault();
    return false;
  }

  croppImage() {
    const self = this;
    const fileEle = document.getElementById("file") as HTMLInputElement;
    if (fileEle) {
      fileEle.click();
      fileEle.onchange = (evt) => {
        const files = (evt.target as HTMLInputElement).files;
        const file = files[0];
        if (file) {
          if (AppHelper.isApp()) {
            window.URL = window.URL || window["webkitURL"];
            const objectURL = window.URL.createObjectURL(file);
            console.log("objectUrl", objectURL);
            AppHelper.setRouteData(this.webView.convertFileSrc(objectURL));
            const method =
              self.sender.nativeElement.attributes["upload-method"].value;
            // this.router
            //   .navigate([AppHelper.getRoutePath("crop-avatar")], {
            //     cropAvatar: "cropAvatar",
            //     method: method,
            //     fileName: file.name,
            //   })
            //   .then(() => {
            //     fileEle.value = null;
            //   });
            this.navCtrl
              .navigateForward([AppHelper.getRoutePath("crop-avatar")], {
                queryParams: {
                  cropAvatar: "cropAvatar",
                  method: method,
                  fileName: file.name,
                },
                animated: false,
              })
              .then(() => {
                fileEle.value = null;
              });
          } else {
            const fr = new FileReader();
            fr.onload = () => {
              AppHelper.setRouteData(fr.result);
              const method =
                self.sender.nativeElement.attributes["upload-method"].value;
              this.navCtrl
                .navigateForward([AppHelper.getRoutePath("crop-avatar")], {
                  queryParams: {
                    cropAvatar: "cropAvatar",
                    method: method,
                    fileName: file.name,
                  },
                  animated: false,
                })
                .then(() => {
                  fileEle.value = null;
                });
            };
            fr.readAsDataURL(file);
          }
        }
      };
    }
  }
}
