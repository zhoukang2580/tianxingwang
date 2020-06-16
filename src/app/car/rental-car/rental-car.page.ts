import { FileHelperService } from "./../../services/file-helper.service";
import { flyInOut } from "./../../animations/flyInOut";
import {
  finalize,
  debounceTime,
  distinctUntilChanged,
  tap
} from "rxjs/operators";
import { LoginService } from "./../../services/login/login.service";
import { Subscription, interval, of } from "rxjs";
import { AppHelper } from "./../../appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { TmcService } from "./../../tmc/tmc.service";
import { NavController, IonInput, Platform, IonItem } from "@ionic/angular";
import { CarService } from "./../car.service";
import { CallNumber } from '@ionic-native/call-number/ngx';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
@Component({
  selector: "app-rental-car",
  templateUrl: "./rental-car.page.html",
  styleUrls: ["./rental-car.page.scss"],
  animations: [flyInOut],
  providers: [AndroidPermissions, Geolocation, InAppBrowser, CallNumber]
})
export class RentalCarPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("mobileInput") mobileInput: IonInput;
  private subscription = Subscription.EMPTY;
  private senSmsCodeSubscription = Subscription.EMPTY;
  private inputMobuleSubscription = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  private browser: InAppBrowserObject;
  private defaultMobile = "";
  private verifiedMobiles: string[];
  private isSetTop = false;
  @ViewChild("mobilItem") mobilItemEl: IonItem;
  @ViewChild("searchResultEl") searchResultEl: ElementRef<HTMLElement>;
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
    private plt: Platform,
    private callNumber: CallNumber,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private iab: InAppBrowser
  ) { }
  onModify() {
    this.isModify = true;
    this.mobile = "";
    if (this.mobileInput) {
      setTimeout(() => {
        this.mobileInput.setFocus();
      }, 200);
    }
  }
  private openInAppBrowser(url: string) {
    if (this.browser) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.browser.close();
    }
    const color = "#2596D9";
    const options: InAppBrowserOptions = {
      usewkwebview: "yes",
      location: "no",
      toolbar: "yes",
      zoom: "no",
      footer: "no",
      // beforeload: "yes",// 设置后，beforeload事件才能触发
      closebuttoncaption: "关闭(CLOSE)",
      closebuttoncolor: "#2596D9",
      navigationbuttoncolor: "#2596D9",
      // toolbarcolor:"#2596D90f"
    };
    // url = `http://test.version.testskytrip.com/download/test.html`;
    this.browser = this.iab.create(encodeURI(url), "_blank", options);
    // this.subscriptions.push(this.browser.on("beforeload").subscribe((evt,callback)=>{
    //   console.log("beforeload");
    //   console.log(evt);
    //   console.log("beforeload",evt);
    //   console.log("beforeload",evt.message,evt.data,evt.code,evt.url);
    //   if(evt.url){
    //     // Load this URL in the inAppBrowser.
    //     callback(evt.url);
    //   }else{
    //     console.log("无法加载url");
    //   }
    // }))
    this.subscriptions.push(this.browser.on("loaderror").subscribe(evt => {
      console.log("loaderror");
      console.log(evt);
      console.log("loaderror", evt);
      console.log("loaderror", evt.message, evt.data, evt.code, evt.url);
      

    }))
    this.subscriptions.push(this.browser.on("loadstart").subscribe(evt => {
      console.log("loadstart");
      console.log(evt);
      console.log("loadstart", evt);
      console.log("loadstart", evt.message, evt.data, evt.code, evt.url);
      if (evt.url) {
        const m = evt.url.match(/tel:(\d+)/i);
        if (m && m.length >= 2) {
          const phoneNumber = m[1];
          console.log("phoneNumber" + phoneNumber);
          if (phoneNumber) {
            // window.location.href=`tel:${phoneNumber}`;
            this.callNumber.callNumber(phoneNumber, true)
              .then(res => console.log('Launched dialer!', res))
              .catch(err => console.log('Error launching dialer', err));
          }
        }
      }
    }))
    this.subscriptions.push(this.browser.on("loadstop").subscribe(evt => {
      console.log("loadstop");
      console.log(evt);
      console.log("loadstop", evt);
      console.log("loadstop", evt.message, evt.data, evt.code, evt.url);
    }))
    this.subscriptions.push(this.browser.on("message").subscribe(evt => {
      console.log("message");
      console.log(evt);
      console.log("message", evt);
      console.log("message", evt.message, evt.data, evt.code, evt.url);
    }))
    const sub = this.browser.on("exit").subscribe(() => {
      setTimeout(() => {
        if (sub) {
          sub.unsubscribe();
        }
        if (this.browser) {
          this.browser.hide();
        }
      }, 100);
    });
  }
  onOpenTest() {
    const url = 'https://open.es.xiaojukeji.com/webapp/feESWebappLogin/index';
    // this.router.navigate(["open-url"], {
    //   queryParams: {
    //     url,
    //     title: "用车",
    //     isOpenInAppBrowser: AppHelper.isApp(),
    //     isHideTitle: AppHelper.isDingtalkH5() || AppHelper.isWechatH5()
    //   }
    // });
    this.openInAppBrowser(url);
  }
  ngAfterViewInit() { }
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
      this.carService.checkIfMobileIsVerified(mobile).then(res => {
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
    this.checkIfMobileVerified(one);
  }
  onChange() {
    this.setTop();
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
          } else {
            this.checkIfMobileVerified(one);
          }
        }
      });
  }
  private async checkPermission() {
    let ok = true;
    if (this.plt.is("ios")) {
      this.geolocation.getCurrentPosition();
      return ok;
    }
    try {
      ok =
        (await this.androidPermissions
          .checkPermission(
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
          )
          .then(r => r.hasPermission)
          .catch(() => false)) ||
        (await this.androidPermissions
          .checkPermission(
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
          )
          .then(r => r.hasPermission)
          .catch(() => false));
      if (!ok) {
        await this.androidPermissions.requestPermissions([
          this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
        ]);
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

    if (url) {
      if (AppHelper.isApp()) {
        await this.checkPermission();
        // this.router.navigate(["open-url"], {
        //   queryParams: {
        //     url,
        //     title: "用车",
        //     isOpenInAppBrowser: AppHelper.isApp(),
        //     isHideTitle: AppHelper.isDingtalkH5() || AppHelper.isWechatH5()
        //   }
        // });
        this.openInAppBrowser(url);
      } else {
        this.carService.setOpenUrlSource(url);
        if (window.navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            () => {
              this.router.navigate([AppHelper.getRoutePath("open-rental-car")]);
            },
            error => {
              if (error.code) {
                //          0  :  不包括其他错误编号中的错误
                // ​		     1  :  用户拒绝浏览器获取位置信息
                // ​		     2  :  尝试获取用户信息，但失败了
                // ​		     3  :  设置了timeout值，获取位置超时了
                if (error.code == error.PERMISSION_DENIED) {
                  const msg = `（设置）Settings -> （通用）General -> （重置） Reset-> （重置定位于隐私）Reset Location & Privacy.
                  （设置）Settings -> （隐私）Privacy  开启 Location Services.（设置）->（隐私）->（定位服务）->（Safari 网站）`;
                  AppHelper.alert(msg);
                } else {
                  // AppHelper.alert("无法启用定位，请检查手机浏览器设置");
                }
              }
              this.router.navigate([AppHelper.getRoutePath("open-rental-car")]);
            },
            {
              enableHighAccuracy: false,
              maximumAge: 1000 * 60,
              timeout: 5 * 1000
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
    this.carService.getLocalMobiles().then(res => {
      this.verifiedMobiles = Object.keys(res) || [];
    });
  }
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe(p => {
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
      this.checkIfMobileVerified(this.mobile);
    }
  }
}
