import { ActivatedRoute } from '@angular/router';
import { AppHelper } from './../../appHelper';
import { LoginService } from './../../services/login/login.service';
import { AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-password',
  templateUrl: './account-password.page.html',
  styleUrls: ['./account-password.page.scss'],
})
export class AccountPasswordPage implements OnInit {
  identityEntity: IdentityEntity;
  originalPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  validatedBySmsCode = false;// 是否已经通过手机验证码验证，不需要输入原密码
  constructor(identityService: IdentityService,
    private alertCtrl: AlertController,
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    identityService.getIdentity().then(id => {
      this.identityEntity = id;
    });
    console.log("account-password constructor");
    this.route.params.subscribe((data: { validatedBySmsCode: "false" | "validatedBySmsCode"; }) => {
      console.log(data);
      this.validatedBySmsCode = data.validatedBySmsCode === "validatedBySmsCode";
    });
  }
  sendMsmCode() {
    this.loginService.sendMobileCode("18817392136").subscribe(res => {
      const { SendInterval, ExpiredInterval } = res.Data;
      this.router.navigate([AppHelper.getRoutePath("change-password-by-msm-code"), {
        SendInterval,
        ExpiredInterval,
        receiveSmsCodeTime: Math.floor(Date.now() / 1000)
      }]);
    });
  }
  forgetOriginalPassword() {
    this.alertCtrl.create({
      message: "你的账号当前已经绑定手机号，可以通过短信验证码重置登录密码，是否发送验证码到 18817392136 ?",
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
    }).then(a => {
      a.present();
      a.onDidDismiss().then(data => {
        if (data) {
          console.log(data)
        }
      });
    });
  }
  done() {
    if (!this.validatedBySmsCode) {
      if (!this.originalPassword) {
        alert("原密码不能为空");
        return;
      }
    }
  }
  ngOnInit() {
  }

}
