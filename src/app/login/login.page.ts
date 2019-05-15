import { LoginService } from "../services/login/login.service";
import { Component, OnInit, NgZone, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { LoginEntity } from "src/app/services/login/login.entity";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable, interval, Subscription } from "rxjs";
import { AppHelper } from "../appHelper";
import { LanguageHelper } from "../languageHelper";
import { ConfigEntity } from "../services/config/config.entity";
import { ConfigService } from "../services/config/config.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit ,OnDestroy{
  loginEntity: LoginEntity;
  pageInfo: ConfigEntity;
  form: FormGroup;
  validImageCodeCount: number = 0;
  private _phoneErrorCount: number = 0;
  loginSubscription=Subscription.EMPTY;
  get phoneErrorCount() {
    return this._phoneErrorCount;
  }
  set phoneErrorCount(value: number) {
    this._phoneErrorCount = value;
  }
  private _userErrorCount: number = 0;
  get userErrorCount() {
    return this._userErrorCount;
  }
  set userErrorCount(value) {
    this._userErrorCount = value;
  }
  message: string;
  countDown: number;
  loginType: string = "user";
  imgSrc$: Observable<any>;
  loading$: Observable<boolean>;
  isMobileNumberOk = false;
  isApp:boolean;
  constructor(
    private loginService: LoginService,
    private configService: ConfigService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loading$ = this.loginService.getLoading();
    this.isApp=AppHelper.isApp();
  }
  ngOnInit() {
    this.loginEntity = new LoginEntity();
    this.form = this.fb.group({
      Name: [AppHelper.getStorage<string>("loginName")],
      Password: [null],
      ImageCode: [null], // 验证码，图片验证码，
      MobileCode: [null], // 手机验证码
      Mobile: [null], // 手机号
      WechatCode: [null],
      DingtalkCode: [null]
    });
    this.form.controls["Mobile"].valueChanges.subscribe((m: string) => {
      this.isMobileNumberOk = `${m}`.length >= 11;
    });
  }
  ionViewWillEnter(){
    this.initPage();
  }
  async loginByWechat() {
    try{
      if (AppHelper.isApp()) {
        const appId = await AppHelper.getWechatAppId();
        const code = await this.getWechatCode(appId).catch(() => null);
        if (code) {
          this.loginType = "wechat";
          this.form.patchValue({ WechatCode: code });
          this.login();
        }
      }
    }catch(e){
      alert(e);
    }
  }
  getWechatCode(appId:string) {
    const wechat = window['wechat'];
    if (wechat) {
      return wechat.getCode(appId);
    }
    return Promise.reject("cordova wechat plugin is unavailable");
  }
  initPage() {
    this.refreshImageCode();
    this.configService.get().then(r => {
      this.pageInfo = r;
    }).catch(e => {
      console.error(e);
    });
  }
  refreshImageCode() {
    this.imgSrc$ = this.loginService.getImage();
  }
  switchLoginType(type: string) {
    this.loginType = type;
    this.form.patchValue({
      ImageCode: ''
    });
  }
  
  async login() {

    this.loginEntity.Name = this.form.value.Name;
    this.loginEntity.Password = this.form.value.Password;
    this.loginEntity.ImageCode = this.form.value.ImageCode;
    this.loginEntity.Mobile = this.form.value.Mobile;
    this.loginEntity.MobileCode = this.form.value.MobileCode;
    this.loginEntity.DingtalkCode = this.form.value.DingtalkCode;
    this.loginEntity.WechatCode = this.form.value.WechatCode;
    this.loginEntity.UUID = await AppHelper.getUUID();
    switch (this.loginType) {
      case "user":
        if (!this.loginEntity.Name) {
          this.message = LanguageHelper.getLoginNameTip();
          return;
        }
        if (!this.loginEntity.Password) {
          this.message = LanguageHelper.getLoginPasswordTip();
          return;
        }
        if (
          this.userErrorCount >= this.validImageCodeCount &&
          !this.loginEntity.ImageCode
        ) {
          this.message = LanguageHelper.getLoginImageCodeTip();
          return;
        }
        this.loginSubscription=  this.loginService.userLogin(this.loginEntity).subscribe(r => {
          if (!r.Ticket) {
            this.userErrorCount++;
          } else {
            AppHelper.setStorage("loginname", this.loginEntity.Name);
            this.jump();
          }
        },e=>{
          alert(e);
        });
        break;
      case "mobile":
        if (!this.loginEntity.Mobile) {
          this.message = LanguageHelper.getLoginMobileTip();
          return;
        }
        if (!this.loginEntity.MobileCode) {
          this.message = LanguageHelper.getLoginMobileCodeTip();
          return;
        }
        this.loginSubscription=  this.loginService
          .mobileLogin(this.loginEntity)
          .subscribe(r => {
            if (!r.Ticket) {
              this.userErrorCount++;
            } else {
              this.jump();
            }
          },e=>{
            this.message=e;
          });
        break;
      case "dingtalk":
       this.loginSubscription= this.loginService.dingtalkLogin(this.loginEntity).subscribe(r => {
          if (r.Ticket) {
            this.jump();
          }
        });
        break;
      case "wechat":
      this.loginSubscription=  this.loginService.wechatLogin(this.loginEntity).subscribe(r => {
          if (r.Ticket) {
            this.jump();
          }
        });
        break;
      case "device":
      this.loginSubscription=  this.loginService.deviceLogin(this.loginEntity).subscribe(r => {
          if (!r.Ticket) {
            this.loginType = "user";
          } else {
            this.jump();
          }
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
    if (
      this.phoneErrorCount >= this.validImageCodeCount &&
      !this.form.value.ImageCode
    ) {
      this.message = LanguageHelper.getLoginImageCodeTip();
      return;
    }
   const subscription= this.loginService
      .sendMobileCode(this.form.value.Mobile, this.form.value.ImageCode)
      .subscribe(r => {
        if (r.Data) {
          this.startCountDonw(r.Data.SendInterval);
        }
        this.message = r.Message;
      }, e => {
        this.message = e instanceof Error ? e.message : typeof e === 'string' ? e : e;
      },()=>{
        setTimeout(() => {
          if(subscription){
            subscription.unsubscribe();
          }
        }, 100);
      });
  }
  jump() // 跳转
  {
    console.log("Jump");
    // 空会默认重定向到首页
    // 如果首页添加了guard守卫，则会校验，校验不通过，自动重定向到login
    // 如果加了autorityguard才会校验
    const toPageRouter = this.loginService.getToPageRouter() || "";
    this.router.navigate([AppHelper.getRoutePath(toPageRouter)]);
  }
  ngOnDestroy(){
    this.loginSubscription.unsubscribe();
  }
}
