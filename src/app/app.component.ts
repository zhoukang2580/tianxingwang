import { Component } from "@angular/core";

import {
  Platform, AlertController, ToastController,
  IonApp, ActionSheetController, LoadingController, NavController, ModalController
} from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Router } from "@angular/router";
import { AppHelper } from "./appHelper";
import { ConfigService } from './services/config/config.service';
import { HttpClient } from '@angular/common/http';
import { LanguageHelper } from './languageHelper';
import { wechatHelper } from './wechatHelper';
import { DingtalkHelper } from './dingtalkHelper';
export interface App {
  loadUrl: (
    url: string,
    prams?: {
      wait?: number;
      openexternal?: boolean;
      clearhistory?: boolean;// 不能为true，否则Android抛异常
    }) => void;
    show:()=>void;
    cancelLoadUrl:()=>void;
    overrideButton:(btn:"volumeup"|"volumedown"|"menubutton",override?:boolean)=>void;
    overrideBackbutton:(override?:boolean)=>void;
    clearCache:()=>void;
    clearHistory:()=>void;
    backHistory:()=>void;
    exitApp:()=>void;
};
@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class AppComponent {
  app:App;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private navCtrl:NavController,
    private modalController: ModalController,
    private statusBar: StatusBar,
    private router: Router,
    private configService: ConfigService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
  ) {
    debugger;
    // console.log(this.router.config);
    if(!this.checkWechatOpenId() || !this.checkDingtalkUnionid())
      return;
    if (this.platform.is("ios")) {
      AppHelper.setDeviceName("ios");
    }
    if (this.platform.is("android")) {
      AppHelper.setDeviceName("android");
    }
    AppHelper.setHttpClient(this.http);
    AppHelper.setAlertController(this.alertController);
    AppHelper.setToastController(this.toastController);
    AppHelper.setModalController(this.modalController);
    this.initializeApp();
  }
  checkWechatOpenId()
  {
    
    if(AppHelper.isWechatH5() || AppHelper.isWechatMini())
    {
      if(!AppHelper.checkQueryString("openid"))
      {
        window.location.href=AppHelper.getApiUrl()+"/home/GetWechatUser?path="+ AppHelper.getRedirectUrl()+"&domain="+ AppHelper.getDomain();
        return false;
      }
      wechatHelper.openId=AppHelper.getQueryString("openid");
      wechatHelper.unionId=AppHelper.getQueryString("unionId");
   }
   return true;
  }
  checkDingtalkUnionid()
  {
    if(AppHelper.isDingtalkH5())
    {
      if(!AppHelper.checkQueryString("unionid"))
      {
        window.location.href=AppHelper.getApiUrl()+"/home/GetDingtalkUser?path="+ AppHelper.getRedirectUrl()+"&domain="+ AppHelper.getDomain();
        return false;
      }
      DingtalkHelper.unionId=AppHelper.getQueryString("unionid");
   }
   return true;
  }
  initializeApp() {
 
    this.getConfigInfo();
    AppHelper.getDomain();// 
    AppHelper.setQueryParamers();
    const path = AppHelper.getQueryString("path");
    const unloginPath = AppHelper.getQueryString("unloginpath");
    if (AppHelper.getTicket() && path) {
      this.jumpToRoute("/tabs/home").then(() => {
        this.jumpToRoute(path);
      });
    }
    else if (!AppHelper.getTicket() && unloginPath) {
      this.router.navigate([AppHelper.getRoutePath(unloginPath)]);
    }
    else {
      this.router.navigate([AppHelper.getRoutePath("login")]);
    }
    // this.router.navigate([AppHelper.getRoutePath("register")]);
    // this.router.navigate([AppHelper.getRoutePath("account-password")]);
    // this.router.navigate([AppHelper.getRoutePath("account-email")]);
    // this.router.navigate([AppHelper.getRoutePath("account-dingtalk")]);
    // this.router.navigate([AppHelper.getRoutePath("account-wechat")]);
    // this.router.navigate([AppHelper.getRoutePath("account-bind")]);
    // this.router.navigate([AppHelper.getRoutePath("account-mobile")]);
    // this.router.navigate([AppHelper.getRoutePath("account-device")]);
    // this.router.navigate([AppHelper.getRoutePath("change-password-by-msm-code")]);
    // this.router.navigate([AppHelper.getRoutePath("tabs/my")]);
    // this.router.navigate([AppHelper.getRoutePath('/tabs/my/my-credential-management')]);
    // this.router.navigate([AppHelper.getRoutePath('/tabs/my/my-credential-management-add')]);
    // this.router.navigate([AppHelper.getRoutePath('function-test')]);
    this.platform.ready().then(() => {
      this.app=navigator['app'];
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.backButtonAction();
  }
  private getConfigInfo() {
    this.configService.get();
  }
  private jumpToRoute(route: string) {
    return this.router.navigate([AppHelper.getRoutePath(route)]);
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
        } else {
          AppHelper.toast(LanguageHelper.getAppDoubleClickExit());
          lastClickTime = Date.now();
        }
      } else {
        this.navCtrl.back();
        // window.history.back();
      }
    });
  }
}
