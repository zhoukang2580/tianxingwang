import { ActivatedRoute } from "@angular/router";
import { AppHelper } from "./../../appHelper";
import { LoginService } from "./../../services/login/login.service";
import { AlertController } from "@ionic/angular";
import { Component, OnInit,OnDestroy } from "@angular/core";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { Router } from "@angular/router";

import { AccountService } from "../account.service";
import { tap } from "rxjs/operators";
import { Subscription, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
class PasswordModel {
  /// <summary>
  /// 老密码
  /// </summary>
  OldPassword: string;
  /// <summary>
  /// 新密码
  /// </summary>
  NewPassword: string;
  /// <summary>
  /// 确认密码
  /// </summary>
  SurePassword: string;
}

@Component({
  selector: "app-account-password",
  templateUrl: "./account-password.page.html",
  styleUrls: ["./account-password.page.scss"]
})
export class AccountPasswordPage implements OnInit,OnDestroy {
  identityEntity: IdentityEntity;
  passwordModel: PasswordModel;
  confirmNewPassword: string;
  modifyPasswordSubscription = Subscription.EMPTY;
  validatedBySmsCode = false; // 是否已经通过手机验证码验证，不需要输入原密码
  loading$:Observable<boolean>;
  constructor(
    identityService: IdentityService,
    private alertCtrl: AlertController,
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private apiService:ApiService
  ) {
    identityService.getIdentity().then(id => {
      this.identityEntity = id;
    });
    this.loading$=this.apiService.getLoading();
    console.log("account-password constructor");
    this.route.params.subscribe(
      (data: { validatedBySmsCode: "false" | "validatedBySmsCode" }) => {
        console.log(data);
        this.validatedBySmsCode =
          data.validatedBySmsCode === "validatedBySmsCode";
      }
    );
    this.passwordModel = new PasswordModel();
  }
  sendMsmCode() {
    this.loginService.sendMobileCode("18817392136").subscribe(res => {
      const { SendInterval, ExpiredInterval } = res.Data;
      this.router.navigate([
        AppHelper.getRoutePath("account-password-by-msm-code"),
        {
          SendInterval,
          ExpiredInterval,
          receiveSmsCodeTime: Math.floor(Date.now() / 1000)
        }
      ]);
    });
  }
  forgetOriginalPassword() {
    this.router.navigate([AppHelper.getRoutePath("password-code"),{Id:this.identityEntity.Id}]);
  }
  done() {
    if (!this.validatedBySmsCode) {
      if (!this.passwordModel.OldPassword) {
        alert("原密码不能为空");
        return;
      }
    }
    if (!this.passwordModel.NewPassword) {
      alert("请输入新密码");
      return;
    }
    if (this.passwordModel.NewPassword !== this.passwordModel.SurePassword) {
      alert("两次输入的密码不一致");
      return;
    }
    this.modifyPasswordSubscription.unsubscribe();
    this.modifyPasswordSubscription = this.accountService
      .modifyPassword(this.passwordModel)
      .pipe(tap(a => console.log(a)))
      .subscribe(
        res => {
          if (res.Status) {
            alert("密码修改成功");
          } else {
            alert(res.Message);
          }
        },
        e => alert(e)
      );
  }
  ngOnInit() { }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.modifyPasswordSubscription.unsubscribe();
  }
}
