import { environment } from "src/environments/environment";
import { CalendarService } from "./tmc/calendar.service";
import { MessageModel, MessageService } from "./message/message.service";
import { FlightService } from "./flight/flight.service";

import {
  Component,
  AfterViewInit,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnChanges
} from "@angular/core";

import {
  Platform,
  AlertController,
  ToastController,
  ActionSheetController,
  LoadingController,
  NavController,
  ModalController
} from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Router } from "@angular/router";
import { AppHelper } from "./appHelper";
import { ConfigService } from "./services/config/config.service";
import { HttpClient } from "@angular/common/http";
import { LanguageHelper } from "./languageHelper";
import { WechatHelper } from "./wechatHelper";
import { Observable } from "rxjs";
import { ApiService } from "./services/api/api.service";
import {
  trigger,
  style,
  state,
  transition,
  animate
} from "@angular/animations";
export interface App {
  loadUrl: (
    url: string,
    prams?: {
      wait?: number;
      openexternal?: boolean;
      clearhistory?: boolean; // 不能为true，否则Android抛异常
    }
  ) => void;
  show: () => void;
  cancelLoadUrl: () => void;
  overrideButton: (
    btn: "volumeup" | "volumedown" | "menubutton",
    override?: boolean
  ) => void;
  overrideBackbutton: (override?: boolean) => void;
  clearCache: () => void;
  clearHistory: () => void;
  backHistory: () => void;
  exitApp: () => void;
}
@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out"))
    ])
  ]
})
export class AppComponent
  implements AfterViewInit, AfterContentInit, OnChanges {
  app: App;
  message$: Observable<MessageModel>;
  openSelectCity$: Observable<boolean>;
  loading$: Observable<boolean>;
  @ContentChildren("img") images: QueryList<HTMLImageElement>;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private navCtrl: NavController,
    private modalController: ModalController,
    private statusBar: StatusBar,
    private router: Router,
    private configService: ConfigService,
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
    private flightService: FlightService,
    private flydayService: CalendarService,
    messageService: MessageService
  ) {
    // console.log = this.log;
    // console.log(this.router.config);
    this.message$ = messageService.getMessage();
    this.openSelectCity$ = flightService.getOpenCloseSelectCityPageSources();
    this.loading$ = apiService.getLoading();
    // if (!this.checkWechatOpenId() || !this.checkDingtalkUnionid()) return;
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
    this.platform.ready().then(() => {
      document.addEventListener("backbutton", () => {
        this.backButtonAction();
      }, false);
      this.splashScreen.show();
      this.splashScreen.hide();
      console.log(`platform ready`);
      this.app = navigator["app"];
      this.statusBar.styleDefault();
      if (AppHelper.isApp() && this.platform.is("android")) {
        if (AppHelper.isApp()) {
          if (this.platform.is('android')) {
            this.splashScreen.show();
            const hcpPlugin = window['hcp'];
            hcpPlugin.loadHcpPage();
          }
          this.splashScreen.hide();
        }
        setTimeout(async () => {
          this.splashScreen.hide();
          // console.log(`uuid = ${await AppHelper.getUUID()}`);
        }, 5000);
      }
    });
  }
  ngOnChanges() {
    console.log("ngOnChanges", this.images);
  }
  log(message?: any, ...optionalParams: any[]) {
    console.info(message, optionalParams);
  }
  ngAfterViewInit() {
    this.splashScreen.hide();
  }
  ngAfterContentInit() {
    console.log(this.images);
    this.images.changes.subscribe(d => {
      console.log("ngAfterContentInit", d);
    });
  }
  checkWechatOpenId() {
    const paramters = AppHelper.getQueryParamers();
    if (paramters.openid) {
      WechatHelper.openId = paramters.openid || "";
    } else if (paramters.IsOpen) {
      return true;
    } else if (AppHelper.isWechatMini()) {
      WechatHelper.wx.miniProgram.navigateTo({
        url:
          "/pages/login/index?IsLogin=true&IsOpen=true&domain=" +
          AppHelper.getDomain() +
          "&getUrl=" +
          encodeURIComponent(AppHelper.getApiUrl() + "/home/GetWechatUser")
      });
      return false;
    } else if (AppHelper.isWechatH5()) {
      if (!AppHelper.checkQueryString("openid")) {
        let url =
          AppHelper.getApiUrl() +
          "/home/GetWechatCode?IsLogin=true&IsOpen=true&path=" +
          AppHelper.getRedirectUrl() +
          "&domain=" +
          AppHelper.getDomain() +
          "&ticket=" +
          AppHelper.getTicket();
        AppHelper.redirect(url);
        return false;
      }
    }
    return true;
  }
  checkDingtalkUnionid() {
    const paramters = AppHelper.getQueryParamers();
    if (paramters.IsOpen) {
      return true;
    } else if (AppHelper.isDingtalkH5()) {
      if (!AppHelper.checkQueryString("unionid")) {
        const url =
          AppHelper.getApiUrl() +
          "/home/GetDingtalkCode?IsLogin=true&IsOpen=true&path=" +
          AppHelper.getRedirectUrl() +
          "&domain=" +
          AppHelper.getDomain();
        AppHelper.redirect(url);
        return false;
      }
    }
    return true;
  }
  initializeApp() {
    AppHelper.getDomain(); //
    AppHelper.setQueryParamers();
    if (!this.checkWechatOpenId() || !this.checkDingtalkUnionid()) {
      return;
    }
    const path = AppHelper.getQueryString("path");
    const unloginPath = AppHelper.getQueryString("unloginpath");
    let hash = window.location.hash;
    if (hash) {
      hash = hash.replace("#", "");
    }
    if (AppHelper.getTicket() && path) {
      this.jumpToRoute("").then(() => {
        this.jumpToRoute(path);
      });
    } else if (!AppHelper.getTicket() && unloginPath) {
      this.router.navigate([AppHelper.getRoutePath(unloginPath)]);
    } else if (hash) {
      this.jumpToRoute("").then(() => {
        this.jumpToRoute(path);
      });
    } else {
      this.router.navigate([AppHelper.getRoutePath("")]);
    }
  }
  private jumpToRoute(route: string) {
    return this.router.navigate([AppHelper.getRoutePath(route)]).then(() => {
      if (environment.production) {
        return;
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
      // this.router.navigate([AppHelper.getRoutePath("flight-list")]);
      // this.router.navigate([AppHelper.getRoutePath('/tabs/my/my-credential-management-add')]);
      // this.router.navigate([AppHelper.getRoutePath('search-flight')]);
      // this.router.navigate([AppHelper.getRoutePath("select-customer")]);
      // this.router.navigate([AppHelper.getRoutePath("search-train")]);
      // this.router.navigate([AppHelper.getRoutePath("flight-book")]);
      // this.router.navigate([AppHelper.getRoutePath("train-book")]);
      // this.router.navigate([AppHelper.getRoutePath("search-hotel")]);
      // this.router.navigate([AppHelper.getRoutePath("hotel-list")]);
      // this.router.navigate([AppHelper.getRoutePath("hotel-book")]);
      // this.router.navigate([AppHelper.getRoutePath("product-tabs")], { queryParams: { tabId: 3 } });
      // this.router.navigate([AppHelper.getRoutePath("tabs/trip")]);
      this.router.navigate([AppHelper.getRoutePath("tabs/home")]);
      // this.router.navigate([AppHelper.getRoutePath("order-detail")], { queryParams: { tabId: 1, orderId:  } });
    });
  }

  private lastClickTime = 0;
  private async backButtonAction() {
    console.log("backbutton url = " + this.router.url);
    let count = 1;
    this.apiService.hideLoadingView();
    this.flightService.setOpenCloseSelectCityPageSources(false);
    const t = await this.modalController.getTop();
    if (t) {
      await t.dismiss().catch(_ => { });
      return;
    }
    const a = await this.alertController.getTop();
    if (a) {
      await a.dismiss().catch(_ => { });
      return;
    }
    if (
      this.router.url.includes("login") ||
      this.router.url.includes("tabs")
    ) {
      console.log("is exit app", Date.now() - this.lastClickTime);
      if (Date.now() - this.lastClickTime <= 2000) {
        navigator["app"].exitApp();
      } else {
        AppHelper.toast(LanguageHelper.getAppDoubleClickExit());
        this.lastClickTime = Date.now();
      }
    } else {
      this.navCtrl.back();
      count++;
      console.log(`backbutton back count=${count}`);
      // window.history.back();
    }
  }
}
