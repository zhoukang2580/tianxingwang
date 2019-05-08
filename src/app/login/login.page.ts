import { LoginService } from "../services/login/login.service";
import { Component, OnInit, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { LoginEntity } from "src/app/services/login/login.entity";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable, interval } from "rxjs";
import { finalize } from "rxjs/operators";
import { AppHelper } from "../appHelper";
import { LoginLanguage } from "./login.language";
import { ConfigEntity } from "../services/config/config.entity";
import { ConfigService } from "../services/config/config.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit {
  loginEntity: LoginEntity;
  pageInfo: ConfigEntity;
  form: FormGroup;
  validImageCodeCount: number = 0;
  private _phoneErrorCount: number = 0;
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
  constructor(
    private loginService: LoginService,
    private configService: ConfigService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loading$ = this.loginService.getLoading();
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
    this.initPage();
  }
  initPage() {
    this.refreshImageCode();
    this.configService.get().then(r => {
      this.pageInfo = r;
    }).catch(e=>{
      console.error(e);
    });
  }
  refreshImageCode() {
    this.imgSrc$ = this.loginService.getImage();
  }
  switchLoginType(type: string) {
    this.loginType = type;
    this.form.patchValue({
      ImageCode:''
    });
  }

  async login() {
    // 以下指示给出如何获取某个值做验证，后面再做界面上的反馈
    if (this.form.invalid) {
      return "表单无效";
    }
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
          this.message = LoginLanguage.getNameTip();
          return;
        }
        if (!this.loginEntity.Password) {
          this.message = LoginLanguage.getPasswordTip();
          return;
        }
        if (
          this.userErrorCount >= this.validImageCodeCount &&
          !this.loginEntity.ImageCode
        ) {
          this.message = LoginLanguage.getImageCodeTip();
          return;
        }
        this.loginService.userLogin(this.loginEntity).subscribe(r => {
          if (!r.Ticket) {
            this.userErrorCount++;
          } else {
            this.jump();
          }
        });
        break;
      case "mobile":
        if (!this.loginEntity.Mobile) {
          this.message = LoginLanguage.getMobileTip();
          return;
        }
        if (!this.loginEntity.MobileCode) {
          this.message = LoginLanguage.getMobileCodeTip();
          return;
        }
        this.loginService
          .mobileLogin(this.loginEntity)
          .subscribe(r => {
            if (!r.Ticket) {
              this.userErrorCount++;
            } else {
              this.jump();
            }
          });
        break;
      case "dingtalk":
        this.loginService.dingtalkLogin(this.loginEntity).subscribe(r => {
          if (r.Ticket) {
            this.jump();
          }
        });
        break;
      case "wechat":
        this.loginService.wechatLogin(this.loginEntity).subscribe(r => {
          if (r.Ticket) {
            this.jump();
          }
        });
        break;
      case "device":
        this.loginService.deviceLogin(this.loginEntity).subscribe(r => {
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
    const intervalSubscribtion=interval(1000).subscribe(v=>{
      this.countDown--;
      if (this.countDown <= 0) {
        this.countDown =0;
        if (intervalSubscribtion) {
          intervalSubscribtion.unsubscribe();
        }
      }
    });
  }
  sendLoginMobileCode() {
    if (!this.form.value.Mobile) {
      this.message = LoginLanguage.getMobileTip();
      return;
    }
    if (
      this.phoneErrorCount > this.validImageCodeCount &&
      !this.form.value.ImageCode
    ) {
      this.message = LoginLanguage.getImageCodeTip();
      return;
    }
    this.loginService
      .sendMobileCode(this.form.value.Mobile, this.form.value.ImageCode)
      .subscribe(r => {
        if (r.Data) {
          this.startCountDonw(r.Data.SendInterval);
        } 
        this.message = r.Message;
      }, e => {
        this.message = e instanceof Error ? e.message : typeof e === 'string' ? e : e;
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
}
