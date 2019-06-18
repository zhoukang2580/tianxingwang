import { LoginService } from "../services/login/login.service";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable, interval, Subscription } from "rxjs";
import { AppHelper } from "../appHelper";
import { LanguageHelper } from "../languageHelper";
import { ConfigEntity } from "../services/config/config.entity";
import { ConfigService } from "../services/config/config.service";
import { Config } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { RequestEntity } from '../services/api/Request.entity';
import { WechatHelper } from '../wechatHelper';
import { IdentityService } from '../services/identity/identity.service';
import { DingtalkHelper } from '../dingtalkHelper';

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit, OnDestroy, AfterViewInit {
  loginEntity: RequestEntity;
  pageInfo: ConfigEntity;
  form: FormGroup;
  deviceInfo: any;
  loginSubscription = Subscription.EMPTY;
  message: string;
  countDown: number;
  loginType: string = "user";
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
    private config: Config
  ) {
    this.config.set('swipeBackEnabled', false);
    this.loading$ = this.loginService.getLoading();
    this.isShowWechatLogin = AppHelper.isApp();
  }
  ngAfterViewInit() {

  }
  onSlideEvent(valid: boolean) {
    if (valid) {
      if (this.SlideEventType === "login") {
        this.login();
      }
      else if (this.SlideEventType === "sendmobilecode") {
        this.sendLoginMobileCode();
      }
      this.isShowImageCode = false;
    }
  }
  ngOnInit() {
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
    this.identityService.getIdentity().then(r => {

      if (!r || !r.Ticket) {
        // alert(AppHelper.isApp());
        if (AppHelper.isApp()) {
          this.loginType = "device";
          this.login();
        }
      }
      else
      {
        this.jump(true);
      }
    })

  }
  setLoginButton() {
    if (this.loginType == "user") {
      this.isLoginOk = this.form.value.Name && this.form.value.Password;
    }
    else if (this.loginType == "mobile") {
      this.isLoginOk = this.form.value.MobileCode;
    }
  }


  ionViewWillEnter() {
    this.initPage();
  }
  async loginByWechat() {
    try {
      if (AppHelper.isApp()) {
        const appId = await AppHelper.getWechatAppId();
        const code = await this.getWechatCode(appId).catch(() => null);
        if (code) {
          this.loginType = "wechat";
          this.form.patchValue({ WechatCode: code,WechatSdkType:"App" });
          this.login();
        }
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  getWechatCode(appId: string) {
    const wechat = window['wechat'];
    if (wechat) {
      return wechat.getCode(appId);
    }
    return Promise.reject("cordova wechat plugin is unavailable");
  }
  initPage() {
    this.configService.get().then(r => {
      this.pageInfo = r;
    }).catch(e => {
      console.error(e);
    });

  }
  switchLoginType(type: string) {
    this.loginType = type;

  }
  showImageCode(type: string) {
    this.SlideEventType = type;
    this.isShowImageCode = true;
  }
  onLoginButton(type: string) {
    if (this.loginType == "user") {
      this.showImageCode(type);
    }
    else {
      this.login();
    }
  }
  async login() {
    this.loginEntity.IsShowLoading=true;
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
        this.loginSubscription = this.loginService.login("ApiLoginUrl-Home-Login", this.loginEntity).subscribe(r => {
          if (!r.Ticket) {
          } else {
            AppHelper.setStorage("loginname", this.loginEntity.Data.Name);
            console.log("login success" + JSON.stringify(r, null, 2));
            this.jump(true);
          }
        }, e => {
          AppHelper.alert(e);
        });
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
          .subscribe(r => {
            if (r.Ticket) {
              this.jump(true);
            }
          }, e => {
            this.message = e;
          });
        break;
      case "dingtalk":
        this.loginEntity.Data.Code = this.form.value.DingtalkCode;
        this.loginSubscription = this.loginService.login("ApiLoginUrl-Home-DingTalkLogin", this.loginEntity).pipe(
          finalize(() => {
            this.loginType = "user";
          })
        ).subscribe(r => {
          if (r.Ticket) {
            this.jump(true);
          }
        });
        break;
      case "wechat":
        this.loginEntity.Data.SdkType = this.form.value.WechatSdkType;
        this.loginEntity.Data.Code = this.form.value.WechatCode;
        this.loginSubscription = this.loginService.login("ApiLoginUrl-Home-WechatLogin", this.loginEntity).pipe(
          finalize(() => {
            this.loginType = "user";
          })
        ).subscribe(r => {
          if (r.Ticket) {
            this.jump(true);
          }
        });
        break;
      case "device":
        this.loginEntity.Data.Device = await AppHelper.getDeviceId();
        this.loginEntity.Data.DeviceName = await AppHelper.getDeviceName();
        this.loginEntity.Data.Token = AppHelper.getStorage("loginToken");
        this.loginSubscription = this.loginService.login("ApiLoginUrl-Home-DeviceLogin", this.loginEntity).pipe(
          finalize(() => {
            this.loginType = "user";
          })
        ).subscribe(r => {
          if (!r.Ticket) {
            this.loginType = "user";
          } else {
            this.jump(false);
          }
        }, () => {
          this.loginType = "user";
        });
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
      .subscribe(r => {
        if (!r.Status && r.Message) {
          AppHelper.alert(r.Message);
          return;
        }
        if (r.Data) {
          this.startCountDonw(r.Data.SendInterval);
        }
        this.message = r.Message;
      }, e => {
        this.message = e instanceof Error ? e.message : typeof e === 'string' ? e : e;
      }, () => {
        setTimeout(() => {
          if (subscription) {
            subscription.unsubscribe();
          }
        }, 100);
      });
  }
  async jump(isCheckDevice: boolean) // 跳转
  {

    this.loginType = "user";
    const toPageRouter = this.loginService.getToPageRouter() || "";
    if (isCheckDevice && AppHelper.isApp()) {
      var uuid = await AppHelper.getDeviceId();
      console.log('uuid ' + uuid);
      this.loginService.checkIsDeviceBinded(uuid).subscribe(res => {
        console.log("checkIsDeviceBinded " + JSON.stringify(res, null, 2));
        // 需要绑定
        if (res.Status) {
          this.router.navigate([AppHelper.getRoutePath("account-bind"), {
            IsActiveMobile: res.Data.IsActiveMobile,
            Mobile: res.Data.Mobile,
            Path: toPageRouter
          }]);
        } else {
          this.router.navigate([AppHelper.getRoutePath(toPageRouter)]);
        }
      }, e => {
        this.router.navigate([AppHelper.getRoutePath(toPageRouter)]);
      });
    }
    else {
      this.router.navigate([AppHelper.getRoutePath(toPageRouter)]);
    }
  }
  forgetPassword() {
    this.router.navigate([AppHelper.getRoutePath("password-check")]);
  }
  register() {
    this.router.navigate([AppHelper.getRoutePath("register")]);
  }
  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }
}
