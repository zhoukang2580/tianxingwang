import { FileHelperService } from "src/app/services/file-helper.service";
import { environment } from "src/environments/environment";
import { MessageModel, MessageService } from "./message/message.service";

import {
  Component,
  AfterViewInit,
  AfterContentInit,
  OnChanges,
  OnInit,
} from "@angular/core";

import {
  Platform,
  AlertController,
  ToastController,
  ActionSheetController,
  LoadingController,
  NavController,
  ModalController,
  PopoverController,
} from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { NavigationStart, Router } from "@angular/router";
import { AppHelper } from "./appHelper";
import { ConfigService } from "./services/config/config.service";
import { HttpClient } from "@angular/common/http";
import { LanguageHelper } from "./languageHelper";
import { WechatHelper } from "./wechatHelper";
import { Observable } from "rxjs";
import { ApiService } from "./services/api/api.service";
import { AppVersion } from "@ionic-native/app-version/ngx";

import {
  trigger,
  style,
  state,
  transition,
  animate,
} from "@angular/animations";
import { ImageRecoverService } from "./services/imageRecover/imageRecover.service";
import { Keyboard } from "@ionic-native/keyboard/ngx";
import { filter, map, mergeMap, switchMap } from "rxjs/operators";
import { OpenUrlComponent } from "./pages/components/open-url-comp/open-url.component";
import { IdentityService } from "./services/identity/identity.service";
import { CordovaPushPluginHelper } from "./cordovaPushPluginHelper";
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
  implements AfterViewInit, AfterContentInit, OnChanges, OnInit
{
  app: App = window.navigator["app"];
  messages: MessageModel[];
  openSelectCity$: Observable<boolean>;
  showFlyDayPage$: Observable<boolean>;
  loading$: Observable<{ isLoading: boolean; msg: string }>;
  get hasmsg() {
    return this.messages && this.messages.some((it) => !it.IsRead);
  }
  testmessage;
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
    private identityService:IdentityService,
    private appversion: AppVersion,
    private imageRecoverService: ImageRecoverService,
    messageService: MessageService,
    fileService: FileHelperService,
    private keybord: Keyboard
  ) {
    window['OpenUrlComponent']=OpenUrlComponent;
    this.messages = [];
    window["isAndroid"] = this.platform.is("android");
    messageService.getMessage().subscribe((msg) => {
      console.log("msg", msg);
      if (msg) {
        this.messages.push(msg);
      }
    });
    this.loading$ = apiService.getLoading().pipe(
      mergeMap((l) =>
        AppHelper.loadingSubject.pipe(
          map((l2) => {
            if (l) {
              if (l.isLoading) {
                return l;
              }
            }
            if (l2) {
              if (l2.isLoading) {
                return l2;
              }
            }
            return l;
          })
        )
      )
    );
    if (AppHelper.isApp()) {
      this.router.events
        .pipe(filter((evt) => evt instanceof NavigationStart))
        .subscribe(() => {
          this.keybord.hide();
        });
    }
    if (this.platform.is("ios")) {
      AppHelper.setDeviceName("ios");
    }
    if (this.platform.is("android")) {
      AppHelper.setDeviceName("android");
    }

    this.initializeApp();
    this.platform.ready().then(() => {
      // if (this.platform.is("ios") && AppHelper.isApp()) {
      //   this.splashScreen.show();
      // }
      console.log(`platform ready`);
      this.app = navigator["app"];
      document.addEventListener(
        "backbutton",
        () => {
          this.backButtonAction();
        },
        false
      );
    });
  }
  async ngOnInit() {}
  ngOnChanges() {}
  ngAfterViewInit() {
    if (AppHelper.isApp()) {
      this.platform.ready().then(() => {
        this.splashScreen.hide();
      });
    }
  }
  ngAfterContentInit() {
    console.log("ngAfterContentInit");
  }
  async onTap(msg, del = false) {
    try {
      const id = await this.identityService.getIdentityAsync();
      const ticket = id.Ticket;
      if (del) {
        msg.IsRead = true;
        return;
      }
      if (this.messages) {
        this.messages.forEach((m) => {
          m.IsRead = true;
        });
      }
      if (msg && msg.Url) {
        const url = JSON.stringify(msg.Url);
        if (url.includes("http")) {
          if (!url.includes(AppHelper.getTicketName())) {
            if (url.includes("?")) {
              msg.Url = `${msg.Url}&${AppHelper.getTicketName()}=${ticket}`;
            } else {
              msg.Url = `${msg.Url}?${AppHelper.getTicketName()}=${ticket}`;
            }
          }
          AppHelper.modalController
            .create({
              component: OpenUrlComponent,
              componentProps: {
                isOpenAsModal: true,
                url: msg.Url,
              },
            })
            .then((m) => {
              m.present();
            });
        } else {
          AppHelper.jump(this.router, msg.Url, {});
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  getPath() {
    let path = AppHelper.getQueryString("path");
    path = decodeURIComponent(path);
    let hash = window.location.hash;
    if (hash && !path) {
      path = hash.replace("#", "");
    }
    return path;
  }
   private async initPush() {
    await this.platform.ready();
    this.identityService
      .getIdentitySource()
      .pipe(switchMap(() => this.identityService.getStatus()))
      .subscribe((ok) => {
        if (ok) {
          CordovaPushPluginHelper.initPush(this.appversion, this.apiService);
        }
      });
  }
  initializeApp() {
    if (AppHelper.isApp()) {
      this.initPush();
    }
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
        const routehome = AppHelper.getQueryString("routehome")
          ? AppHelper.getQueryString("routehome")
          : "";
        this.jumpToRoute(routehome).then(() => {
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
        // this.router.navigate(['order-car-detail']);
        // this.router.navigate(["hr-invitation"]);
        // this.router.navigate(["bpm-home"]);
        // this.router.navigate(["wms-add-product"]);
        // this.router.navigate(["wms-inventory-day-report"]);
        // this.router.navigate(["bpm-product-addmodify"]);
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
        curUrl.includes("login") ||
        curUrl.includes("home") ||
        curUrl.includes("tabs/my") ||
        curUrl.includes("/tabs/trip")
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
        console.log(
          `backbutton back count=${count},curUrl=${curUrl}, AppHelper.getRoutePath("tabs/trip")=${AppHelper.getRoutePath(
            "tabs/trip"
          )}`
        );
        // window.history.back();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
