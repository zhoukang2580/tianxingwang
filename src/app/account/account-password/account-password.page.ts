import { ActivatedRoute } from "@angular/router";
import { AppHelper } from "./../../appHelper";
import { LoginService } from "./../../services/login/login.service";
import { AlertController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { Router } from "@angular/router";
import { PasswordModel } from "src/app/flight/models/PasswordModel";
import { AccountService } from "../account.service";
import { tap } from "rxjs/operators";

@Component({
  selector: "app-account-password",
  templateUrl: "./account-password.page.html",
  styleUrls: ["./account-password.page.scss"]
})
export class AccountPasswordPage implements OnInit {
  identityEntity: IdentityEntity;
  passwordModel: PasswordModel;
  confirmNewPassword: string;
  validatedBySmsCode = false; // 是否已经通过手机验证码验证，不需要输入原密码
  constructor(
    identityService: IdentityService,
    private alertCtrl: AlertController,
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {
    identityService.getIdentity().then(id => {
      this.identityEntity = id;
    });
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
        AppHelper.getRoutePath("change-password-by-msm-code"),
        {
          SendInterval,
          ExpiredInterval,
          receiveSmsCodeTime: Math.floor(Date.now() / 1000)
        }
      ]);
    });
  }
  forgetOriginalPassword() {
    this.alertCtrl
      .create({
        message:
          "你的账号当前已经绑定手机号，可以通过短信验证码重置登录密码，是否发送验证码到 18817392136 ?",
        buttons: [
          {
            text: "取消",
            role: "cancel"
          },
          {
            text: "发送",
            handler: () => {
              this.sendMsmCode();
            }
          }
        ]
      })
      .then(a => {
        a.present();
        a.onDidDismiss().then(data => {
          if (data) {
            console.log(data);
          }
        });
      });
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
    this.accountService
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
  ngOnInit() {}
}
