import { FileHelperService } from "./../../services/file-helper.service";
import { flyInOut } from "./../../animations/flyInOut";
import { finalize, debounceTime, distinctUntilChanged } from "rxjs/operators";
import { LoginService } from "./../../services/login/login.service";
import { Subscription, interval, of } from "rxjs";
import { AppHelper } from "./../../appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { TmcService } from "./../../tmc/tmc.service";
import { NavController, IonInput } from "@ionic/angular";
import { CarService } from "./../car.service";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
// import { Geolocation } from "@ionic-native/geolocation/ngx";
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
@Component({
  selector: "app-rental-car",
  templateUrl: "./rental-car.page.html",
  styleUrls: ["./rental-car.page.scss"],
  animations: [flyInOut],
  providers: [AndroidPermissions]
})
export class RentalCarPage implements OnInit, OnDestroy {
  @ViewChild("mobileInput") mobileInput: IonInput;
  private subscription = Subscription.EMPTY;
  private senSmsCodeSubscription = Subscription.EMPTY;
  private inputMobuleSubscription = Subscription.EMPTY;
  private defaultMobile = "";
  private verifiedMobiles: string[];
  searchMobiles: string[];
  mobile: string;
  message: string;
  countDown: number;
  isSending = false;
  isModify = false;
  fetching = "正在获取默认手机号";
  verifySmsCode = "";
  isMobileVerified = false;
  isMobileValid = false;
  constructor(
    private carService: CarService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private fileService: FileHelperService,
    private androidPermissions: AndroidPermissions
  ) { }
  back() {
    this.navCtrl.pop();
  }
  onModify() {
    this.isModify = true;
    this.mobile = "";
    if (this.mobileInput) {
      setTimeout(() => {
        this.mobileInput.setFocus();
      }, 200);
    }
  }
  onBlur() {
    this.isModify = false;
    if (!this.mobile) {
      this.mobile = this.defaultMobile;
    }
    this.checkIfMobileVerified();
  }
  private checkIfMobileVerified() {
    this.validateMobile();
    if (this.mobile && this.defaultMobile) {
      this.isMobileVerified = this.mobile == this.defaultMobile;
      if (this.isMobileVerified) {
        this.carService.addVerifiedMobile(this.mobile);
      }
      return;
    }
    if (this.mobile) {
      this.carService.checkIfMobileIsVerified(this.mobile).then(res => {
        this.isMobileVerified = res;
      });
    }
  }
  private startCountDonw(count: number) {
    this.countDown = count;
    const intervalSubscribtion = interval(1000).subscribe(v => {
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
  }
  onChange() {
    this.inputMobuleSubscription.unsubscribe();
    this.searchMobiles = [];
    this.inputMobuleSubscription = of(this.mobile)
      .pipe(debounceTime(240), distinctUntilChanged())
      .subscribe(_ => {
        if (this.verifiedMobiles && this.verifiedMobiles.length) {
          const one = this.verifiedMobiles.find(it => it == this.mobile);
          if (!one) {
            this.searchMobiles = this.verifiedMobiles.filter(it =>
              it.includes(this.mobile)
            );
          }
        }
        this.checkIfMobileVerified();
      });
  }
  private async checkPermission() {
    let ok = true;
    try {
      ok = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(r => r.hasPermission).catch(() => false) ||
        await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(r => r.hasPermission).catch(() => false)
      if (!ok) {
        await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION, this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION])
      }
      // AppHelper.alert((geo && geo.coords) || "无定位信息");
    } catch (e) {
      // AppHelper.alert(e);
      ok = false;
    }
    return ok;
  }
  validateCode() {
    if (!this.verifySmsCode) {
      AppHelper.alert("请输入验证码");
      return;
    }
    this.senSmsCodeSubscription = this.carService
      .validateMobileCode(this.mobile, this.verifySmsCode)
      .subscribe(
        res => {
          this.isMobileVerified = res.Status;
          if (res.Message) {
            AppHelper.alert(res.Message);
          }
        },
        e => {
          this.isMobileVerified = false;
          AppHelper.alert(e.Message || e.message || "验证码验证失败");
        }
      );
  }
  sendCode() {
    if (!this.mobile) {
      AppHelper.alert("请输入手机号");
      return;
    }
    if (this.countDown > 0) {
      AppHelper.alert("请稍后再试");
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
        r => {
          if (!r.Status && r.Message) {
            AppHelper.alert(r.Message);
            return;
          }
          if (r.Data) {
            this.startCountDonw(r.Data.SendInterval);
          }
          this.message = r.Message;
        },
        e => {
          this.message =
            e instanceof Error ? e.message : typeof e === "string" ? e : e;
        }
      );
  }
  async onRentalCar() {
    if (!this.mobile) {
      AppHelper.alert("请输入手机号");
      return;
    }
    const url = await this.carService.verifyStaff({ Mobile: this.mobile });

    // if (url) {
    //   await this.router.navigate([AppHelper.getRoutePath("open-rental-car")]);
    //   this.carService.setOpenUrlSource(url);
    // }
    if (url) {
      if (AppHelper.isApp()) {
        await this.checkPermission();
        this.router.navigate(["open-url"], {
          queryParams: {
            url,
            title: "用车",
            isOpenInAppBrowser: AppHelper.isApp(),
            isHideTitle: AppHelper.isDingtalkH5() || AppHelper.isWechatH5()
          }
        });
      } else {
        window.location.href = url;
      }
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  private initLocalMobiles() {
    this.carService.getLocalMobiles().then(res => {
      this.verifiedMobiles =
        (res && res.mobiles && res.mobiles.length && res.mobiles) ||
        [
          // "18817263748",
          // "18817263788",
          // "18817268765",
          // "18817368765",
          // "18817268765"
        ];
    });
  }
  ngOnInit() {
    this.initLocalMobiles();
    this.subscription = this.route.queryParamMap.subscribe(p => {
      this.getAccountInfo();
    });
  }
  private validateMobile() {
    this.isMobileValid = this.mobile && this.mobile.length == 11;
  }
  private async getAccountInfo() {
    const info = await this.carService
      .getAccountInfo()
      .catch(_ => ({ Mobile: "" }));
    this.fetching = "";
    if (info) {
      this.defaultMobile = info.Mobile;
      this.mobile = info.Mobile;
      if (!this.mobile) {
        this.onModify();
      } else {
        this.searchMobiles = [];
      }
    }
    this.checkIfMobileVerified();
  }
}
