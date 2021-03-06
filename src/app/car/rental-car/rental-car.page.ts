import { FileHelperService } from "./../../services/file-helper.service";
import { flyInOut } from "./../../animations/flyInOut";
import {
  finalize,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs/operators";
import { LoginService } from "./../../services/login/login.service";
import { Subscription, interval, of } from "rxjs";
import { AppHelper } from "./../../appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { TmcService } from "./../../tmc/tmc.service";
import { NavController, IonInput, Platform, IonItem } from "@ionic/angular";
import { CarService } from "./../car.service";
import {
  EventEmitter,
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { WechatHelper } from "src/app/wechatHelper";
import { SwiperSlidesComponent } from "src/app/components/swiper-slides/swiper-slides.component";
import { ConfigService } from "src/app/services/config/config.service";
@Component({
  selector: "app-rental-car",
  templateUrl: "./rental-car.page.html",
  styleUrls: ["./rental-car.page.scss"],
  animations: [flyInOut],
  providers: [AndroidPermissions, Geolocation],
})
export class RentalCarPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("mobileInput") mobileInput: IonInput;
  private subscription = Subscription.EMPTY;
  private senSmsCodeSubscription = Subscription.EMPTY;
  private inputMobuleSubscription = Subscription.EMPTY;
  private defaultMobile = "";
  private verifiedMobiles: string[];
  private isSetTop = false;
  private latLng: { lat: number; lng: number; locationInfo: any };
  @ViewChild("mobilItem") mobilItemEl: IonItem;
  @ViewChild("searchResultEl") searchResultEl: ElementRef<HTMLElement>;
  searchMobiles: string[];
  mobile: string;
  message: string;
  countDown: number;
  isSending = false;
  isCanLocatePos = true;
  isModify = false;
  fetching = "???????????????????????????";
  verifySmsCode = "";
  isMobileVerified = false;
  isMobileValid = false;
  constructor(
    private carService: CarService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private plt: Platform,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private configService: ConfigService
  ) {}
  onModify() {
    this.isModify = true;
    this.mobile = "";
    if (this.mobileInput) {
      setTimeout(() => {
        this.mobileInput.setFocus();
      }, 200);
    }
  }
  private checkCanLocatePos() {
    if (window.navigator) {
      window.navigator.geolocation.getCurrentPosition(
        (r) => {
          this.isCanLocatePos = !!(r && r.coords);
          console.log("window.navigator.geolocation ????????????", r);
        },
        (e) => {
          this.isCanLocatePos = false;
          console.error("????????????", e);
        },
        { timeout: 3000, enableHighAccuracy: true }
      );
    }
  }
  onTestAliPay() {
    // tslint:disable-next-line: max-line-length
    const url = `alipays://platformapi/startApp?appId=20000125&orderSuffix=h5_route_token%3D%22RZ41KxkNHYPoXtUZ2Oo21WzMmvIcSQmobilecashierRZ41%22%26is_h5_route%3D%22true%22#Intent;scheme=alipays;package=com.eg.android.AlipayGphone;end`;
    this.router.navigate([AppHelper.getRoutePath("open-rental-car")], {
      queryParams: { url },
    });
  }
  onTestWeixinPay() {
    const url = `weixin://wap/pay?prepayid%3Dwx23112706591939564b95cc511161441500`;
    this.router.navigate([AppHelper.getRoutePath("open-rental-car")], {
      queryParams: { url },
    });
  }
  onOpenTest() {
    const url =
      "https://open.es.xiaojukeji.com/webapp/feESWebappLogin/index?ticket=fmx18DLsOzBwd_ngDA8B5xr_1-04sz6zi4lO_BKvEdYkzbsKwkAQRuF3OfUQ_tnNjnFae9_BS7w0KyhWIe8uwerAab6FLpI6aBBGd9KNXkiXNBq9kjL6-E8jORwxTiQYZ3KKIt95aSoRTcaV9H1UYyYXPq_v-zKToZCvxo300OTu3opxJ_HNklqtI8ZjOxhPUusvAAD__w==&cell=11000005334";
    // this.router.navigate(["open-url"], {
    //   queryParams: {
    //     url,
    //     title: "??????",
    //     isOpenInAppBrowser: AppHelper.isApp(),
    //     isHideTitle: AppHelper.isDingtalkH5() || AppHelper.isWechatH5()
    //   }
    // });
    this.router.navigate([AppHelper.getRoutePath("open-rental-car")], {
      queryParams: { url },
    });
  }
  async onTestShare() {
    await AppHelper.platform.ready();
    const url = `https://common.diditaxi.com.cn/webapp/sharetrips/page?oid=TWpnNU5qTTNOemsxTVRBNE9UTTRNRFEy&productType=262&uid=862019777772141&sign=d7641ed5c1fefb5c1d915bdf5afde3fe&lang=zh-CN&originId=1&webappChannel=es_webapp&statArg=manual&carProductid=260&isSendBeReadIM=1&newVersion=true&es_banner_hide=1&showShareTips=true`;
    WechatHelper.shareWebpage({
      webTitle: "????????????",
      webDescription: "??????",
      webpageUrl: url,
    });
  }
  async onTestShareText() {
    await AppHelper.platform.ready();
    const url = `testskytrip.com`;
    WechatHelper.shareText("??????????????????");
  }
  ngAfterViewInit() {}
  private setTop() {
    if (this.isSetTop) {
      return;
    }
    if (this.mobilItemEl && this.mobilItemEl["el"]) {
      requestAnimationFrame(() => {
        if (this.searchResultEl && this.searchResultEl.nativeElement) {
          const rect = this.mobilItemEl["el"].getBoundingClientRect();
          if (rect) {
            this.searchResultEl.nativeElement.style.top = rect.top + 1 + "px";
            this.isSetTop = true;
          }
        }
      });
    }
  }
  onBlur() {
    this.isModify = false;
    if (!this.mobile) {
      this.mobile = this.defaultMobile;
    }
    this.checkIfMobileVerified(this.mobile);
  }
  private checkIfMobileVerified(mobile: string) {
    this.validateMobile(mobile);
    if (mobile == this.defaultMobile) {
      this.isMobileVerified = mobile == this.defaultMobile;
      return;
    }
    if (mobile) {
      this.carService.checkIfMobileIsVerified(mobile).then((res) => {
        this.isMobileVerified = res;
      });
    }
  }
  private startCountDonw(count: number) {
    this.countDown = count;
    const intervalSubscribtion = interval(1000).subscribe((v) => {
      this.countDown--;
      if (this.countDown <= 0) {
        this.countDown = 0;
        if (intervalSubscribtion) {
          intervalSubscribtion.unsubscribe();
        }
      }
    });
  }
  onSelect(one: string) {
    this.searchMobiles = [];
    this.mobile = one;
    this.checkIfMobileVerified(one);
  }
  onChange() {
    this.setTop();
    this.inputMobuleSubscription.unsubscribe();
    this.searchMobiles = [];
    this.inputMobuleSubscription = of(this.mobile)
      .pipe(debounceTime(240), distinctUntilChanged())
      .subscribe((_) => {
        if (this.verifiedMobiles && this.verifiedMobiles.length) {
          const one = this.verifiedMobiles.find((it) => it == this.mobile);
          if (!one) {
            this.searchMobiles = this.verifiedMobiles.filter((it) =>
              it.includes(this.mobile)
            );
          } else {
            this.checkIfMobileVerified(one);
          }
        }
      });
  }
  async onOpenSettings() {
    const items = [];
    if (this.plt.is("ios")) {
      items.push({
        imageUrl: `assets/images/possettings/settingprivacy.jpg`,
      });
      items.push({
        imageUrl: `assets/images/possettings/locationservice.png`,
      });
      items.push({
        imageUrl: `assets/images/possettings/Safari.jpg`,
      });
      items.push({
        imageUrl: `assets/images/possettings/allow.png`,
      });
      items.push({
        imageUrl: `assets/images/possettings/appitem.jpg`,
      });
      items.push({
        imageUrl: `assets/images/possettings/appallow.png`,
      });
    }
    if (this.plt.is("android")) {
      // items.push(`assets/images/possettings/allow.png`);
      // items.push(`assets/images/possettings/allow.png`);
      // items.push(`assets/images/possettings/allow.png`);
      // items.push(`assets/images/possettings/allow.png`);
      AppHelper.alert(
        `???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????`
      );
      return;
    }
    const tabClick = new EventEmitter();
    const c = await this.configService.getConfigAsync();
    const m = await AppHelper.modalController.create({
      component: SwiperSlidesComponent,
      componentProps: {
        isOpenAsModel: true,
        loadingImage: c && c.PrerenderImageUrl,
        defaultImageUrl: c && c.DefaultImageUrl,
        items: items,
        tap: tabClick,
      },
    });
    if (items.length) {
      const sub = tabClick.subscribe(() => {
        m.dismiss();
      });
      m.present();
      await m.onDidDismiss();
      sub.unsubscribe();
    }
  }
  private async checkPermission() {
    let ok = true;
    try {
      ok =
        (await this.androidPermissions
          .checkPermission(
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
          )
          .then((r) => r.hasPermission)
          .catch(() => false)) ||
        (await this.androidPermissions
          .checkPermission(
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
          )
          .then((r) => r.hasPermission)
          .catch(() => false));
      if (!ok) {
        await this.androidPermissions.requestPermissions([
          this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
        ]);
      }
      await this.geolocation
        .getCurrentPosition({ enableHighAccuracy: true })
        .then((p) => {
          console.log("checkPermission getCurrentPosition", p);
          if (p) {
            this.latLng = {
              lat: p.coords.latitude,
              lng: p.coords.longitude,
              locationInfo: p,
            };
          }
        })
        .catch((e) => {
          this.isCanLocatePos = false;
          console.error(e);
        });
      if (!this.isCanLocatePos) {
        this.checkCanLocatePos();
      }
      // AppHelper.alert((geo && geo.coords) || "???????????????");
    } catch (e) {
      // AppHelper.alert(e);
      ok = false;
    }
    return ok;
  }
  validateCode() {
    if (!this.verifySmsCode) {
      AppHelper.alert("??????????????????");
      return;
    }
    this.senSmsCodeSubscription = this.carService
      .validateMobileCode(this.mobile, this.verifySmsCode)
      .subscribe(
        (res) => {
          this.isMobileVerified = res.Status;
          if (res.Message) {
            AppHelper.alert(res.Message);
          }
        },
        (e) => {
          this.isMobileVerified = false;
          AppHelper.alert(e.Message || e.message || "?????????????????????");
        }
      );
  }
  sendCode() {
    if (!this.mobile) {
      AppHelper.alert("??????????????????");
      return;
    }
    if (this.countDown > 0) {
      AppHelper.alert("???????????????");
      return;
    }
    this.senSmsCodeSubscription.unsubscribe();
    this.isSending = true;
    this.senSmsCodeSubscription = this.carService
      .sendMobileCode(this.mobile)
      .pipe(
        finalize(() => {
          this.isSending = false;
        })
      )
      .subscribe(
        (r) => {
          if (!r.Status && r.Message) {
            AppHelper.alert(r.Message);
            return;
          }
          if (r.Data) {
            this.startCountDonw(r.Data.SendInterval);
          }
          this.message = r.Message;
        },
        (e) => {
          this.message =
            e instanceof Error ? e.message : typeof e === "string" ? e : e;
        }
      );
  }
  async onRentalCar() {
    if (!this.mobile) {
      AppHelper.alert("??????????????????");
      return;
    }
    let url = await this.carService.verifyStaff({ Mobile: this.mobile });
    if (AppHelper.isWechatH5()) {
      window.location.href = url;
      return;
    }
    if (url) {
      if (AppHelper.isApp()) {
        await this.checkPermission();
        if (this.latLng) {
          console.log("latLng ", this.latLng);
          if (!url.includes("lat_from")) {
            url = url.includes("?")
              ? `${url}&lat_from=${this.latLng.lat}&lng_from=${this.latLng.lng}`
              : `${url}?lat_from=${this.latLng.lat}&lng_from=${this.latLng.lng}`;
          }
        }
        // this.router.navigate(["open-url"], {
        //   queryParams: {
        //     url,
        //     title: "??????",
        //     isOpenInAppBrowser: AppHelper.isApp(),
        //     isHideTitle: AppHelper.isDingtalkH5() || AppHelper.isWechatH5()
        //   }
        // });
        this.router.navigate([AppHelper.getRoutePath("open-rental-car")], {
          queryParams: { url: encodeURIComponent(url) },
        });
      } else {
        this.carService.setOpenUrlSource(url);
        if (window.navigator.geolocation && false) {
          navigator.geolocation.getCurrentPosition(
            () => {
              this.router.navigate([AppHelper.getRoutePath("open-rental-car")]);
            },
            (error) => {
              if (error.code) {
                //          0  :  ???????????????????????????????????????
                // ???		     1  :  ???????????????????????????????????????
                // ???		     2  :  ???????????????????????????????????????
                // ???		     3  :  ?????????timeout???????????????????????????
                if (error.code == error.PERMISSION_DENIED) {
                  const msg = `????????????Settings -> ????????????General -> ???????????? Reset-> ???????????????????????????Reset Location & Privacy.
                  ????????????Settings -> ????????????Privacy  ?????? Location Services.????????????->????????????->??????????????????->???Safari ?????????`;
                  AppHelper.alert(msg);
                } else {
                  // AppHelper.alert("???????????????????????????????????????????????????");
                }
              }
              this.router.navigate([AppHelper.getRoutePath("open-rental-car")]);
            },
            {
              enableHighAccuracy: false,
              maximumAge: 1000 * 60,
              timeout: 5 * 1000,
            }
          );
        } else {
          window.location.href = url;
        }
      }
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  private initLocalMobiles() {
    this.carService.getLocalMobiles().then((res) => {
      this.verifiedMobiles = Object.keys(res) || [];
    });
  }
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe((p) => {
      this.checkCanLocatePos();
      this.initLocalMobiles();
      this.getAccountInfo();
    });
  }
  private validateMobile(mobile) {
    this.isMobileValid = mobile && mobile.length == 11;
  }
  private async getAccountInfo() {
    const info = await this.carService
      .getAccountInfo()
      .catch((_) => ({ Mobile: "" }));
    this.fetching = "";
    if (info) {
      this.defaultMobile = info.Mobile;
      this.mobile = info.Mobile;
      if (!this.mobile) {
        this.onModify();
      } else {
        this.searchMobiles = [];
      }
      this.checkIfMobileVerified(this.mobile);
    }
  }
}
