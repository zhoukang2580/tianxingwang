import { StaffService } from './../hr/staff.service';
import { IdentityEntity } from "./../services/identity/identity.entity";
import { LoginService } from "../services/login/login.service";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable, interval, Subscription } from "rxjs";
import { AppHelper } from "../appHelper";
import { LanguageHelper } from "../languageHelper";
import { ConfigEntity } from "../services/config/config.entity";
import { ConfigService } from "../services/config/config.service";
import { Config, ModalController } from "@ionic/angular";
import { finalize } from "rxjs/operators";
import { RequestEntity } from "../services/api/Request.entity";
import { WechatHelper } from "../wechatHelper";
import { IdentityService } from "../services/identity/identity.service";
import { DingtalkHelper } from "../dingtalkHelper";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit, OnDestroy, AfterViewInit {
  loginEntity: RequestEntity;
  pageInfo$: Observable<ConfigEntity>;
  form: FormGroup;
  deviceInfo: any;
  loginSubscription = Subscription.EMPTY;
  identitySubscription = Subscription.EMPTY;
  identity: IdentityEntity;
  message: string;
  countDown: number;
  loginType = "user";
  loading$: Observable<boolean>;
  isMobileNumberOk = false;
  isLoginOk = false;
  isShowWechatLogin: boolean;
  isShowImageCode: boolean;
  SlideEventType: string;
  constructor(
    private loginService: LoginService,
    private identityService: IdentityService,
    private configService: ConfigService,
    private fb: FormBuilder,
    private router: Router,
    private config: Config,
    route: ActivatedRoute,
    private staffService: StaffService,
    private modalCtrl: ModalController
  ) {
    this.config.set("swipeBackEnabled", false);
    this.loading$ = this.loginService.getLoading();
    this.isShowWechatLogin = AppHelper.isApp();
  }
  ngAfterViewInit() {
    console.log("login page ngAfterViewInit");
    this.dismissAllOverlayer();
  }
  private async dismissAllOverlayer() {
    let i = 10;
    let t = await this.modalCtrl.getTop();
    while (--i > 0 && t) {
      t = await this.modalCtrl.getTop();
      if (t) {
        await t.dismiss().catch(_ => { });
      }
    }
  }
  onSlideEvent(valid: boolean) {
    if (valid) {
      if (this.SlideEventType === "login") {
        this.login();
      } else if (this.SlideEventType === "sendmobilecode") {
        this.sendLoginMobileCode();
      }
      this.isShowImageCode = false;
    }
  }
  ngOnInit() {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(r => {
        this.identity = r;
      });
    this.pageInfo$ = this.configService.getConfigSource();
    // this.fileInfo=this.fileService.fileInfo;
    this.loginEntity = new RequestEntity();
    this.loginEntity.Data = {};
    this.form = this.fb.group({
      Name: [AppHelper.getStorage<string>("loginName")],
      Password: [null],
      MobileCode: [null], // 手机验证码
      Mobile: [null], // 手机号
      WechatCode: [null],
      WechatSdkType: [null],
      DingtalkCode: [null]
    });
    this.form.controls["Mobile"].valueChanges.subscribe((m: string) => {
      this.isMobileNumberOk = `${m}`.length >= 11;
    });
    this.form.controls["Name"].valueChanges.subscribe((m: string) => {
      this.setLoginButton();
    });
    this.form.controls["Password"].valueChanges.subscribe((m: string) => {
      this.setLoginButton();
    });
    this.form.controls["MobileCode"].valueChanges.subscribe((m: string) => {
      this.setLoginButton();
    });

    this.setLoginButton();
    this.autoLogin();
  }
  autoLogin() {
    if (!this.identity || !this.identity.Ticket) {
      if (AppHelper.isApp()) {
        this.loginType = "device";
        this.login();
      }
    } else {
      this.jump(true);
    }
  }
  setLoginButton() {
    if (this.loginType == "user") {
      this.isLoginOk = this.form.value.Name && this.form.value.Password;
    } else if (this.loginType == "mobile") {
      this.isLoginOk = this.form.value.MobileCode;
    }
  }
  segmentChanged(evt: CustomEvent) {
    // console.log(evt);
    this.switchLoginType(evt.detail.value);
  }
  async loginByWechat() {
    try {
      if (AppHelper.isApp()) {
        const appId = await AppHelper.getWechatAppId();
        const code = await this.getWechatCode(appId).catch(() => null);
        if (code) {
          this.loginType = "wechat";
          this.form.patchValue({ WechatCode: code, WechatSdkType: "App" });
          this.login();
        }
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  getWechatCode(appId: string) {
    const wechat = window["wechat"];
    if (wechat) {
      return wechat.getCode(appId);
    }
    return Promise.reject("cordova wechat plugin is unavailable");
  }
  switchLoginType(type: string) {
    this.loginType = type;
  }
  showImageCode(type: string) {
    this.SlideEventType = type;
    this.isShowImageCode = true;
  }
  onLoginButton(type: string) {
    console.log("onLoginButton login type " + type);
    if (this.loginType == "user") {
      this.showImageCode(type);
    } else {
      this.login();
    }
  }
  async login() {
    this.loginEntity.IsShowLoading = true;
    switch (this.loginType) {
      case "user":
        this.loginEntity.Data.Name = this.form.value.Name;
        this.loginEntity.Data.Password = this.form.value.Password;
        if (!this.loginEntity.Data.Name) {
          this.message = LanguageHelper.getLoginNameTip();
          return;
        }
        if (!this.loginEntity.Data.Password) {
          this.message = LanguageHelper.getLoginPasswordTip();
          return;
        }
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-Login", this.loginEntity)
          .subscribe(
            r => {
              if (!r.Ticket) {
              } else {
                AppHelper.setStorage("loginname", this.loginEntity.Data.Name);
                console.log("login success" + JSON.stringify(r, null, 2));
                this.jump(true);
              }
            },
            e => {
              AppHelper.alert(e);
            }
          );
        break;
      case "mobile":
        this.loginEntity.Data.Mobile = this.form.value.Mobile;
        this.loginEntity.Data.Code = this.form.value.MobileCode;
        if (!this.loginEntity.Data.Mobile) {
          this.message = LanguageHelper.getLoginMobileTip();
          return;
        }
        if (!this.loginEntity.Data.MobileCode) {
          this.message = LanguageHelper.getMobileCodeTip();
          return;
        }
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-MobileLogin", this.loginEntity)
          .subscribe(
            r => {
              if (r.Ticket) {
                this.jump(true);
              }
            },
            e => {
              this.message = e;
            }
          );
        break;
      case "dingtalk":
        this.loginEntity.Data.Code = this.form.value.DingtalkCode;
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-DingTalkLogin", this.loginEntity)
          .pipe(
            finalize(() => {
              this.loginType = "user";
            })
          )
          .subscribe(r => {
            if (r.Ticket) {
              this.jump(true);
            }
          });
        break;
      case "wechat": {
        this.loginEntity.Data.SdkType = this.form.value.WechatSdkType;
        this.loginEntity.Data.Code = this.form.value.WechatCode;
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-WechatLogin", this.loginEntity)
          .pipe(
            finalize(() => {
              this.loginType = "user";
            })
          )
          .subscribe(
            r => {
              if (r.Ticket) {
                this.jump(true);
              }
            },
            e => {
              AppHelper.alert("wechat登录失败，" + JSON.stringify(e));
            }
          );
        break;
      }
      case "device":
        this.loginEntity.Data.Device = await AppHelper.getDeviceId();
        this.loginEntity.Data.DeviceName = await AppHelper.getDeviceName();
        this.loginEntity.Data.Token = AppHelper.getStorage("loginToken");
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-DeviceLogin", this.loginEntity)
          .pipe(
            finalize(() => {
              setTimeout(() => {
                this.loginType = "user";
              }, 100);
            })
          )
          .subscribe(
            r => {
              if (!r.Ticket) {
                this.loginType = "user";
              } else {
                this.jump(false);
              }
            },
            () => {
              this.loginType = "user";
            }
          );
        break;
    }
  }
  // 发生手机验证码
  startCountDonw(count: number) {
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
  sendLoginMobileCode() {
    if (!this.form.value.Mobile) {
      this.message = LanguageHelper.getLoginMobileTip();
      return;
    }
    const subscription = this.loginService
      .sendMobileCode(this.form.value.Mobile)
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
        },
        () => {
          setTimeout(() => {
            if (subscription) {
              subscription.unsubscribe();
            }
          }, 100);
        }
      );
  }
  private async checkStaff(count: number) {
    const staff = await this.staffService.getStaff();
    await new Promise<any>(s=>{
      setTimeout(() => {
        s();
      }, 1000);
    });
    if (!staff && count < 10) {
      this.checkStaff(++count);
    }else{
      AppHelper.alert("登录失败");
      this.router.navigate(['login']);
    }
  }
  async jump(
    isCheckDevice: boolean // 跳转
  ) {
    await this.checkStaff(0);
    this.loginType = "user";
    const toPageRouter = this.loginService.getToPageRouter() || "";
    if (isCheckDevice && AppHelper.isApp()) {
      await this.checkIsDeviceBinded();
    } else {
      this.router.navigate([AppHelper.getRoutePath(toPageRouter)]);
    }
  }
  async checkIsDeviceBinded() {
    const toPageRouter = this.loginService.getToPageRouter() || "";
    const uuid = await AppHelper.getDeviceId();
    console.log("uuid " + uuid);
    this.loginService.checkIsDeviceBinded(uuid).subscribe(
      res => {
        console.log("checkIsDeviceBinded " + JSON.stringify(res, null, 2));
        // 需要绑定
        if (res.Status) {
          this.router.navigate([
            AppHelper.getRoutePath("account-bind"),
            {
              IsActiveMobile: res.Data.IsActiveMobile,
              Mobile: res.Data.Mobile,
              Path: toPageRouter
            }
          ]);
        } else {
          this.router.navigate([AppHelper.getRoutePath(toPageRouter)]);
        }
      },
      e => {
        this.router.navigate([AppHelper.getRoutePath(toPageRouter)]);
      }
    );
  }
  forgetPassword() {
    this.router.navigate([AppHelper.getRoutePath("password-check")]);
  }
  register() {
    this.router.navigate([AppHelper.getRoutePath("register")]);
  }
  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    this.identitySubscription.unsubscribe();
  }
}
