import { CONFIG } from "src/app/config";
import { IdentityEntity } from "./../services/identity/identity.entity";
import { LoginService } from "../services/login/login.service";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import { interval, Subscription } from "rxjs";
import { AppHelper } from "../appHelper";
import { LanguageHelper } from "../languageHelper";
import { ConfigEntity } from "../services/config/config.entity";
import { ConfigService } from "../services/config/config.service";
import { Config, ModalController, NavController } from "@ionic/angular";
import { finalize } from "rxjs/operators";
import { RequestEntity } from "../services/api/Request.entity";
import { IdentityService } from "../services/identity/identity.service";
import { environment } from "src/environments/environment";
import { WechatHelper } from "../wechatHelper";
import { ApiService } from "../services/api/api.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit, OnDestroy, AfterViewInit {
  loginEntity: RequestEntity;
  config: ConfigEntity;
  form: FormGroup;
  deviceInfo: any;
  loginSubscription = Subscription.EMPTY;
  identitySubscription = Subscription.EMPTY;
  identity: IdentityEntity;
  message: string;
  countDown: number;
  loginType = "user";
  isLogining = false;
  isMobileNumberOk = false;
  isLoginOk = false;
  eyeOn = false;
  isKeyboardShow = false;
  eyeType = "password";
  isShowWechatLogin: boolean = false;
  isShowImageCode: boolean;
  SlideEventType: string;
  environment = environment;
  isApp = AppHelper.isApp();
  defaultLogoUrl: string;
  isWechatMini = AppHelper.isWechatMini();
  isGetWechatMiniMobile: boolean;
  wechatMiniUser: any;
  wechatMiniMobile: any;
  private mockDeviceInfo = {
    Device: `accw125487df1254accw125487df1254`,
    DeviceName: `pc模拟测试`,
  };
  constructor(
    private apiService: ApiService,
    private loginService: LoginService,
    private identityService: IdentityService,
    private configService: ConfigService,
    private fb: FormBuilder,
    private router: Router,
    route: ActivatedRoute,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {
    AppHelper.isWXAppInstalled().then((installed) => {
      this.isShowWechatLogin = installed;
    });
    route.queryParamMap.subscribe((_) => {});
  }
  onToggleEye() {
    this.eyeOn = !this.eyeOn;
    if (this.eyeOn) {
      this.eyeType = "text";
    } else {
      this.eyeType = "password";
    }
  }
  ngAfterViewInit() {
    this.listenKeyboard();
    this.identityService.getIdentityAsync().then((identity) => {
      console.log("login page ngAfterViewInit identity", identity);
    });
    this.dismissAllOverlayer();
    setTimeout(() => {
      this.autoLogin();
    }, 0);
  }
  private listenKeyboard() {
    const innerHeight = window.innerHeight;
    window.addEventListener("resize", () => {
      const newInnerHeight = window.innerHeight;
      if (innerHeight > newInnerHeight) {
        // 键盘弹出事件处理
        // alert("android 键盘弹窗事件");
        this.isKeyboardShow = true;
      } else {
        // 键盘收起事件处理
        // alert("android 键盘收起事件处理");
        this.isKeyboardShow = false;
      }
    });
  }
  private async dismissAllOverlayer() {
    let i = 10;
    let t = await this.modalCtrl.getTop();
    while (--i > 0 && t) {
      t = await this.modalCtrl.getTop();
      if (t) {
        await t.dismiss().catch((_) => {});
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
    this.defaultLogoUrl = CONFIG.getDefaultLogoUrl();
    this.configService.getConfigSource().subscribe((c) => {
      this.config = c;
    });
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe((r) => {
        this.identity = r;
      });
    // this.fileInfo=this.fileService.fileInfo;
    this.loginEntity = new RequestEntity();
    this.loginEntity.Data = {};
    this.form = this.fb.group({
      Name: [AppHelper.getStorage<string>("loginName")],
      Password: [null],
      MobileCode: [null], // 手机验证码
      Mobile: [null], // 手机号
      WechatCode: [null],
      SdkType: [null],
      DingtalkCode: [null],
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
  }
  private autoLogin() {
    if (!AppHelper.isApp()) {
      return;
    }
    this.identityService.getStatus().subscribe((ok) => {
      console.log("this.identityService.getStatus() ok = " + ok);
      if (!ok) {
        if (AppHelper.isApp()) {
          this.loginType = "device";
          this.login();
        }
      } else {
        this.jump(true);
      }
    });
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
        const code = await AppHelper.getWechatCode().catch(() => null);
        if (code) {
          this.loginType = "wechat";
          this.form.patchValue({ WechatCode: code, SdkType: "App" });
          this.login();
        }
      }
    } catch (e) {
      AppHelper.alert(e);
    }
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
      if (!this.checkRquired()) {
        return;
      }
      this.showImageCode(type);
    } else {
      this.login();
    }
  }
  private hideLoadingStatus() {
    requestAnimationFrame(() => {
      this.isLogining = false;
    });
  }
  private checkRquired() {
    this.loginEntity.Data.Name = this.form.value.Name;
    this.loginEntity.Data.Password = this.form.value.Password;
    if (!this.loginEntity.Data.Name) {
      this.message = LanguageHelper.getLoginNameTip();
      return false;
    }
    if (!this.loginEntity.Data.Password) {
      this.message = LanguageHelper.getLoginPasswordTip();
      return false;
    }
    return true;
  }
  async login() {
    this.isLogining = true;
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
        if (AppHelper.isApp()) {
          this.loginEntity.Data.Device = await AppHelper.getDeviceId();
          this.loginEntity.Data.DeviceName = await AppHelper.getDeviceName();
        }
        // this.loginEntity.Data.Device = this.mockDeviceInfo.Device;
        // this.loginEntity.Data.DeviceName = this.mockDeviceInfo.DeviceName;
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-Login", this.loginEntity)
          .pipe(
            finalize(() => {
              this.hideLoadingStatus();
            })
          )
          .subscribe(
            (r) => {
              if (!r.Ticket) {
              } else {
                AppHelper.setStorage("loginname", this.loginEntity.Data.Name);
                console.log("login success" + JSON.stringify(r, null, 2));
                this.jump(true);
              }
            },
            (e) => {
              AppHelper.alert(e);
            }
          );
        break;
      case "mobile":
        this.loginEntity.Data.Password = "";
        this.loginEntity.Data.Mobile = this.form.value.Mobile;
        this.loginEntity.Data.Code = this.form.value.MobileCode;
        if (!this.loginEntity.Data.Mobile) {
          this.message = LanguageHelper.getLoginMobileTip();
          return;
        }
        if (!this.loginEntity.Data.Code) {
          this.message = LanguageHelper.getMobileCodeTip();
          return;
        }
        if (AppHelper.isApp()) {
          this.loginEntity.Data.Device = await AppHelper.getDeviceId();
          this.loginEntity.Data.DeviceName = await AppHelper.getDeviceName();
        }
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-MobileLogin", this.loginEntity)
          .pipe(
            finalize(() => {
              this.hideLoadingStatus();
            })
          )
          .subscribe(
            (r) => {
              if (r.Ticket) {
                this.jump(true);
              }
            },
            (e) => {
              this.message = e;
            }
          );
        break;
      case "dingtalk":
        this.loginEntity.Data.Code = this.form.value.DingtalkCode;
        if (AppHelper.isApp()) {
          this.loginEntity.Data.Device = await AppHelper.getDeviceId();
          this.loginEntity.Data.DeviceName = await AppHelper.getDeviceName();
        }
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-DingTalkLogin", this.loginEntity)
          .pipe(
            finalize(() => {
              this.loginType = "user";
              this.hideLoadingStatus();
            })
          )
          .subscribe((r) => {
            if (r.Ticket) {
              this.jump(false);
            }
          });
        break;
      case "wechat": {
        this.loginEntity.Data.SdkType = this.form.value.SdkType;
        this.loginEntity.Data.Code = this.form.value.WechatCode;
        if (AppHelper.isApp()) {
          this.loginEntity.Data.Device = await AppHelper.getDeviceId();
          this.loginEntity.Data.DeviceName = await AppHelper.getDeviceName();
        }
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-WechatLogin", this.loginEntity)
          .pipe(
            finalize(() => {
              this.loginType = "user";
              this.hideLoadingStatus();
            })
          )
          .subscribe(
            (r) => {
              if (r.Ticket) {
                this.jump(false);
              }
            },
            (e) => {
              AppHelper.alert("wechat登录失败，");
            }
          );
        break;
      }
      case "wechatMiniMobile": {
        this.loginEntity.Data.WechatMiniEncryptedData = this.wechatMiniMobile.encryptedData;
        this.loginEntity.Data.WechatMiniEncryptedIv = this.wechatMiniMobile.iv;
        if (this.wechatMiniMobile.wechatminicode) {
          this.loginEntity.Data.WechatMiniCode = this.wechatMiniMobile.wechatminicode;
        }
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-WechatMiniMobileLogin", this.loginEntity)
          .pipe(
            finalize(() => {
              this.loginType = "user";
              this.hideLoadingStatus();
            })
          )
          .subscribe(
            (r) => {
              if (r.Ticket) {
                this.jump(false);
              }
            },
            (e) => {
              AppHelper.alert("登录失败，请使用其它登陆方式");
            }
          );
        break;
      }
      case "device":
        this.loginEntity.Data.Token = AppHelper.getStorage("loginToken");
        this.loginEntity.Data.Device = await AppHelper.getDeviceId();
        this.loginEntity.Data.DeviceName = await AppHelper.getDeviceName();
        // this.loginEntity.Data.Device = this.mockDeviceInfo.Device;
        // this.loginEntity.Data.DeviceName = this.mockDeviceInfo.DeviceName;
        this.loginSubscription = this.loginService
          .login("ApiLoginUrl-Home-DeviceLogin", this.loginEntity)
          .pipe(
            finalize(() => {
              this.hideLoadingStatus();
              setTimeout(() => {
                this.loginType = "user";
              }, 100);
            })
          )
          .subscribe(
            (r) => {
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
  sendLoginMobileCode() {
    if (!this.form.value.Mobile) {
      this.message = LanguageHelper.getLoginMobileTip();
      return;
    }
    const subscription = this.loginService
      .sendMobileCode(this.form.value.Mobile)
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
  getWechatMiniMobile() {
    const token =
      (this.apiService.apiConfig && this.apiService.apiConfig.Token) || "";
    const key = AppHelper.uuid();
    const desc = "小程序需要获取你的手机号码来完成登陆功能";
    let url = `/pages/phonenumber/index?key=${key}&token=${token}&description=${desc}`;
    if (!this.wechatMiniUser) {
      url = url + "&isLogin=true";
    }
    WechatHelper.wx.miniProgram.navigateTo({ url: url });
    WechatHelper.checkStep(key, this.apiService, (val) => {
      try {
        this.wechatMiniMobile = JSON.parse(val);
        this.loginType = "wechatMiniMobile";
        this.login();
      } catch (e) {
        this.wechatMiniMobile = null;
      }
    });
    this.isGetWechatMiniMobile = true;
  }

  async jump(
    isCheckDevice: boolean // 跳转
  ) {
    const toPageRouter = AppHelper.getToPageAfterAuthorize();
    try {
      this.loginType = "user";
      this.isLogining = false;
      console.log("toPageRouter", toPageRouter);
      if (isCheckDevice && AppHelper.isApp()) {
        const uuid = await AppHelper.getDeviceId();
        this.loginService.checkIsDeviceBinded(uuid);
      }
      // this.loginService.checkIsDeviceBinded(this.mockDeviceInfo.Device);
      this.loginService.checkIsDingtalkBind();
      this.loginService.checkIsWechatBind();
    } catch (e) {
      console.error(e);
    } finally {
      this.navCtrl.navigateRoot(
        (toPageRouter.path || "").includes("login") ? "" : toPageRouter.path,
        {
          queryParams: toPageRouter.queryParams,
        }
      );
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
    this.identitySubscription.unsubscribe();
  }
}
