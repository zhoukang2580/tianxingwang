import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { FileHelperService } from "src/app/services/file-helper.service";
import { environment } from "src/environments/environment";
import { MessageModel, MessageService } from "./message/message.service";

import {
  Component,
  AfterViewInit,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnChanges,
  ContentChild,
  ViewChild,
} from "@angular/core";

import {
  Platform,
  AlertController,
  ToastController,
  ActionSheetController,
  LoadingController,
  NavController,
  ModalController,
  IonImg,
  PopoverController,
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
  animate,
} from "@angular/animations";
import { ImageRecoverService } from "./services/imageRecover/imageRecover.service";
import { ThemeService } from "./services/theme/theme.service";
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
      transition("true<=>false", animate("300ms ease-in-out")),
    ]),
  ],
})
export class AppComponent
  implements AfterViewInit, AfterContentInit, OnChanges {
  app: App = window.navigator["app"];
  message$: Observable<MessageModel>;
  openSelectCity$: Observable<boolean>;
  showFlyDayPage$: Observable<boolean>;
  loading$: Observable<{ isLoading: boolean; msg: string }>;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private modalController: ModalController,
    private popCtrl: PopoverController,
    private navCtrl: NavController,
    private statusBar: StatusBar,
    private router: Router,
    private configService: ConfigService,
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
    private imageRecoverService: ImageRecoverService,
    messageService: MessageService,
    private fileService: FileHelperService
  ) {
    window["isAndroid"] = this.platform.is("android");
    this.message$ = messageService.getMessage();
    this.loading$ = apiService.getLoading();
    if (this.platform.is("ios")) {
      AppHelper.setDeviceName("ios");
    }
    if (this.platform.is("android")) {
      AppHelper.setDeviceName("android");
    }
    AppHelper.platform = platform;
    AppHelper.setHttpClient(this.http);
    AppHelper.setAlertController(this.alertController);
    AppHelper.setToastController(this.toastController);
    AppHelper.setModalController(this.modalController);
    this.initializeApp();
    this.platform.ready().then(() => {
      this.splashScreen.show();
      console.log(`platform ready`);
      this.app = navigator["app"];
      document.addEventListener(
        "backbutton",
        () => {
          this.backButtonAction();
        },
        false
      );
      if (AppHelper.isApp() && this.platform.is("android")) {
        setTimeout(async () => {
          this.splashScreen.hide();
          // console.log(`uuid = ${await AppHelper.getUUID()}`);
        }, 3000);
      }
    });
  }
  ngOnChanges() {}
  ngAfterViewInit() {
    this.splashScreen.hide();
  }
  ngAfterContentInit() {
    console.log("ngAfterContentInit");
  }

  getPath() {
    let path = AppHelper.getQueryString("path");
    path = decodeURIComponent(path);
    let hash = window.location.hash;
    if (hash && !path) {
      path = hash.replace("#", "");
    }
    if (!path) {
      path = "/tabs/tmc-home";
    }
    return path;
  }
  initializeApp() {
    // this.backButtonAction();
    // if (!AppHelper.isApp()) {
    //   const back = window.history.back;
    //   try {
    //     window.history.back = this.navCtrl.pop;
    //   } catch (e) {
    //     window.history.back = back;
    //     console.error(e);
    //   }
    // }
    WechatHelper.LaunchUrl = window.location.href;
    AppHelper.getDomain(); //
    this.showErrorMsg();
    const unloginPath = AppHelper.getQueryString("unloginpath");
    const path = this.getPath();
    if (!AppHelper.getTicket() && unloginPath) {
      this.router.navigate([AppHelper.getRoutePath(unloginPath)]);
    } else if (AppHelper.getTicket() || path) {
      if (AppHelper.getQueryString("unroutehome") != "true") {
        this.jumpToRoute("").then(() => {
          this.jumpToRoute(path);
        });
      } else {
        this.jumpToRoute(path);
      }
    } else {
      this.router.navigate([AppHelper.getRoutePath("")]);
    }
    // this.jumpToRoute("mms-home")
  }
  private showErrorMsg() {
    const paramters = AppHelper.getQueryParamers();
    if (paramters && paramters.message) {
      AppHelper.alert(paramters.message);
    }
  }
  private jumpToRoute(route: string) {
    return this.router.navigate([AppHelper.getRoutePath(route)]).then(() => {
      if (!environment.production) {
        // AppHelper.getQueryParamers()['mmsid'] = 2;
        // this.router.navigate(['mms-order-lottery'], { queryParams: { mmsid: 2 } });
        // this.router.navigate(['mms-admin-home'], { queryParams: { mmsid: 2 } });
        // this.router.navigate(['mms-home'], { queryParams: { mmsid: 2 } });
        // this.router.navigate(['mms-goods'],{queryParams:{mmsid:2}});
        // this.router.navigate(['mms-home'],{queryParams:{mmsid:2}});
        // this.router.navigate(['mms-admin-wechat'],{queryParams:{mmsid:2}});
        // this.router.navigate(['international-hotel-book']);
        // this.router.navigate(['international-hotel-detail']);
        // this.router.navigate(['international-hotel-list']);
        // this.router.navigate(['workflow-list']);
        // this.router.navigate(['qrscan']);
        // this.router.navigate(['function-test']);
        // this.router.navigate(['car-order-detail']);
        this.router.navigate(["business-list"]);
        // flight-order-detail
        //  this.router.navigate(["international-flight-list"],{queryParams:{tabId:"1"}});
        // this.router.navigate(["hr-invitation"], {
        //   queryParams: {
        //     hrid: "163",
        //     hrName: "上海东美在线旅行社有限公司",
        //     costCenterId: "6300000001",
        //     costCenterName: "成本中心财政部",
        //     organizationId: "6300000005",
        //     organizationName: "产品中心",
        //     policyId: "6300000001",
        //     policyName: "一般政策",
        //     roleIds: "24,25",
        //     roleNames: "超级秘书,新秘书",
        //   },
        // });
      }
    });
  }

  private lastClickTime = 0;
  private async backButtonAction() {
    try {
      const curUrl = (this.router.url || "").toLowerCase();
      console.log("backbutton url = " + curUrl);
      let count = 1;
      this.apiService.hideLoadingView();
      const t = await this.modalController.getTop();
      if (t) {
        await t.dismiss();
        return;
      }
      const a = await this.alertController.getTop();
      if (a) {
        await a.dismiss();
        return;
      }
      const p = await this.popCtrl.getTop();
      if (p) {
        await p.dismiss();
        return;
      }
      this.apiService.hideLoadingView();
      if (
        curUrl == "/login" ||
        curUrl == "/tabs/tmc-home" ||
        curUrl == "/home" ||
        curUrl == "/tabs/my" ||
        curUrl == "/tabs/trip"
      ) {
        // console.log("is exit app", Date.now() - this.lastClickTime);
        if (Date.now() - this.lastClickTime <= 2000) {
          navigator["app"].exitApp();
        } else {
          AppHelper.toast(LanguageHelper.getAppDoubleClickExit());
          this.lastClickTime = Date.now();
        }
      } else {
        // if(this.app){
        //   this.app.backHistory();
        // }else{
        //   this.navCtrl.pop();
        // }
        this.navCtrl.pop();
        count++;
        console.log(`backbutton back count=${count}`);
        // window.history.back();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
