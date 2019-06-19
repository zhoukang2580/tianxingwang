
import { Component, AfterViewInit } from "@angular/core";

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
import { WechatHelper } from './wechatHelper';
import { DingtalkHelper } from './dingtalkHelper';
import { RequestEntity } from './services/api/Request.entity';
import { finalize } from 'rxjs/operators';
import { ImageRecoverService } from './services/imagerecover/imageRecover.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
export interface App {
  loadUrl: (
    url: string,
    prams?: {
      wait?: number;
      openexternal?: boolean;
      clearhistory?: boolean;// 不能为true，否则Android抛异常
    }) => void;
  show: () => void;
  cancelLoadUrl: () => void;
  overrideButton: (btn: "volumeup" | "volumedown" | "menubutton", override?: boolean) => void;
  overrideBackbutton: (override?: boolean) => void;
  clearCache: () => void;
  clearHistory: () => void;
  backHistory: () => void;
  exitApp: () => void;
};
@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class AppComponent implements AfterViewInit {
  app: App;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private navCtrl: NavController,
    private modalController: ModalController,
    private statusBar: StatusBar,
    private router: Router,
    private configService: ConfigService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
    private imageRecoverService: ImageRecoverService
  ) {
  
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
  ngAfterViewInit() {
    this.splashScreen.hide();
  }
  checkWechatOpenId() {
    var paramters = AppHelper.getQueryParamers();
    if(paramters.openid)
    {
      WechatHelper.openId=paramters.openid||"";
    }
    else if(paramters.IsOpen)
    {
      return true;
    }
    else if (AppHelper.isWechatMini()) {
      WechatHelper.wx.miniProgram.navigateTo({url: "/pages/login/index?IsLogin=true&IsOpen=true&domain="+AppHelper.getDomain()+"&getUrl="+encodeURIComponent(AppHelper.getApiUrl()+"/home/GetWechatUser")});
      return false;
    }
    else if (AppHelper.isWechatH5()) {
      if (!AppHelper.checkQueryString("openid")) {
        let url = AppHelper.getApiUrl() + "/home/GetWechatCode?IsLogin=true&IsOpen=true&path=" + AppHelper.getRedirectUrl() + "&domain=" + AppHelper.getDomain()
          + "&ticket=" + AppHelper.getTicket();
        AppHelper.redirect(url);
        return false;
      }
    }
    return true;
  }
  checkDingtalkUnionid() {
    var paramters = AppHelper.getQueryParamers();
    if(paramters.IsOpen)
    {
      return true;
    }
    else if (AppHelper.isDingtalkH5()) {
      if (!AppHelper.checkQueryString("unionid")) {
        const url = AppHelper.getApiUrl() + "/home/GetDingtalkCode?IsLogin=true&IsOpen=true&path=" + AppHelper.getRedirectUrl() + "&domain=" + AppHelper.getDomain()
          ;
        AppHelper.redirect(url);
        return false;
      }
    }
    return true;
  }
  initializeApp() {
    this.initializeInfo();
    AppHelper.getDomain();// 
    AppHelper.setQueryParamers();
    if (!this.checkWechatOpenId() || !this.checkDingtalkUnionid())
      return;
    const path = AppHelper.getQueryString("path");
    const unloginPath = AppHelper.getQueryString("unloginpath");
    var hash = window.location.hash;
    if (hash) {
      hash = hash.replace("#", "");
    }
    if (AppHelper.getTicket() && path) {
      this.jumpToRoute("").then(() => {
        this.jumpToRoute(path);
      });
    }
    else if (!AppHelper.getTicket() && unloginPath) {
      this.router.navigate([AppHelper.getRoutePath(unloginPath)]);
    }
    else if (hash) {
      this.jumpToRoute("").then(() => {
        this.jumpToRoute(path);
      });
    }
    else {
      this.router.navigate([AppHelper.getRoutePath("")]);
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
    //this.router.navigate([AppHelper.getRoutePath('book-flight')]);
    setTimeout(() => {
      // this.router.navigate([AppHelper.getRoutePath('function-test')]);
    }, 100);
    this.platform.ready().then(() => {
      this.app = navigator['app'];
      this.statusBar.styleDefault();
      if(AppHelper.isApp()&&this.platform.is("android")){
        setTimeout(async () => {
          this.splashScreen.hide();
          // console.log(`uuid = ${await AppHelper.getUUID()}`);
        }, 5000);
      }
    });
    this.backButtonAction();
  }
  private initializeInfo() {
    this.configService.get();
    this.imageRecoverService.get();
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
          AppHelper.alert("退出应用？",true,'退出',"取消").then(ok=>{
            if(ok){
              navigator['app'].exitApp();
            }
          })
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
