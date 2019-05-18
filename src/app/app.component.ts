import { Component } from "@angular/core";

import { Platform, AlertController, ToastController, IonApp, ActionSheetController, LoadingController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Router } from "@angular/router";
import { AppHelper } from "./appHelper";
import { ConfigService } from './services/config/config.service';
import { HttpClient } from '@angular/common/http';
import { LanguageHelper } from './languageHelper';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private configService: ConfigService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private http:HttpClient
  ) {
    // console.log(this.router.config);
    if (this.platform.is("ios")) {
      AppHelper.setDeviceName("ios");
    }
    if (this.platform.is("android")) {
      AppHelper.setDeviceName("android");
    }
    AppHelper.setHttpClient(this.http);
    this.initializeApp();
  }

  initializeApp() {
    this.getConfigInfo();
    AppHelper.getDomain();// 
    AppHelper.setQueryParamers();
    var path=AppHelper.getQueryString("path");
    var unloginPath=AppHelper.getQueryString("unloginpath");
    if(AppHelper.getTicket() && path)
    {
      this.router.navigate([AppHelper.getRoutePath(path)]);
    }
    else if(!AppHelper.getTicket() && unloginPath)
    {
      this.router.navigate([AppHelper.getRoutePath(unloginPath)]);
    }
    else
    {
      this.router.navigate([AppHelper.getRoutePath("")]);
    }
    // this.router.navigate([AppHelper.getRoutePath("account-password")]);
    // this.router.navigate([AppHelper.getRoutePath("change-password-by-msm-code")]);
    // this.router.navigate([AppHelper.getRoutePath("tabs/my")]);
    // this.router.navigate([AppHelper.getRoutePath('/tabs/my/my-credential-management')]);
    // this.router.navigate([AppHelper.getRoutePath('/tabs/my/my-credential-management-add')]);
    // this.router.navigate([AppHelper.getRoutePath('account-bind')]);
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.extMethod();
    this.backButtonAction();
  }
  private getConfigInfo(){
    this.configService.get();    
  }
  private extMethod() {
    const toast = async msg => {
      const t = await this.toastController.create({
        message: typeof msg === "string" ? msg
          : msg instanceof Error ? msg.message
            : typeof msg === 'object' && msg.message ? msg.message
              : JSON.stringify(msg), position: "middle", duration: 1400
      });
      if (t) {
        t.present();
      }
    };
    window['toast'] = toast;
    const alert = async msg => {
      try {
        const t = await this.alertController.getTop();
        if (t) {
          t.dismiss();
        }
      } catch (e) {
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
  private backButtonAction() {
    let lastClickTime = 0;
    console.log("backbutton url = " + this.router.url);
      this.platform.backButton.subscribe(async () => {
        try {
          const element = await this.actionSheetCtrl.getTop();
          const aEle = await this.alertController.getTop();
          const lEle = await this.loadingCtrl.getTop();
          if (element) {
            element.dismiss();
            console.log("关闭actionsheet");
            return;
          }
          if (aEle) {
            aEle.dismiss();
            console.log("关闭alert");
            return;
          }
          if (lEle) {
            lEle.dismiss();
            console.log("关闭loading");
            return;
          }
        } catch (error) {
          console.error(error);
        }
        if (this.router.url.includes("login") || this.router.url.includes("tabs")) {
          if (Date.now() - lastClickTime <= 2000) {
            navigator['app'].exitApp();
          }else{
            window['toast'](LanguageHelper.getAppDoubleClickExit());
            lastClickTime=Date.now();
          }
        } else {
          window.history.back();
        }
      });
  }
}
