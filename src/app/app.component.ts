import { Component } from "@angular/core";

import { Platform, AlertController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Router } from "@angular/router";
import { AppHelper } from "./appHelper";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private alertController: AlertController
  ) {
    // console.log(this.router.config);
    if (this.platform.is("ios")) {
      AppHelper.setDeviceName("ios");
    }
    if (this.platform.is("android")) {
      AppHelper.setDeviceName("android");
    }
    this.initializeApp();
  }

  initializeApp() {
    this.router.navigate([AppHelper.getRoutePath("")]);
    // this.router.navigate([AppHelper.getRoutePath("account-password")]);
    // this.router.navigate([AppHelper.getRoutePath("change-password-by-msm-code")]);
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    const alert = async msg => {
      try{
        const t =await this.alertController.getTop();
        if(t){
          t.dismiss();
        }
      }catch(e){
        console.error(e);
      }
      (await this.alertController.create({
        header: "提示",
        message: typeof msg === "string" ? msg
          : msg instanceof Error ? msg.message
            : typeof msg === 'object' && msg.message ? msg.message
              : JSON.stringify(msg),
        buttons: [
          {
            text: "确定"
          }
        ]
      })).present();
    };
    window.alert = alert;
  }
}
