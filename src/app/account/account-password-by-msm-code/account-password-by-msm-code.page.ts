import { AppHelper } from '../../appHelper';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { interval } from 'rxjs';
import { LoginService } from '../../services/login/login.service';
import { AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-change-password-by-msm-code',
  templateUrl: './account-password-by-msm-code.page.html',
  styleUrls: ['./account-password-by-msm-code.page.scss'],
})
export class AccountPasswordByMsmCodePage implements OnInit {
  mobile: string;
  smsCode: string; // 验证码
  downCount = 0;
  expiredInterval = 0;
  receiveSmsCodeTime = 0;
  downCountSubscribtion = Subscription.EMPTY;
  constructor(private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService) {
    this.mobile = "18817392136";
    this.route.paramMap.subscribe((params) => {
      console.log(params);
      this.downCount = +params.get("SendInterval") || 0;
      this.expiredInterval = +params.get("ExpiredInterval") || 0;
      this.receiveSmsCodeTime = + params.get("receiveSmsCodeTime");
      if (this.downCount > 0) {
        this.startDownCount(this.downCount);
      }
    });
  }
  unreceiveSmsCode() {
    if (this.downCount > 0) {
      return;
    }
    this.alertCtrl.create({
      subHeader: "重新获取验证码？", keyboardClose: true, buttons: [
        {
          text: "发送",
          handler: () => {
            this.sendMsmCode();
          }
        }
      ]
    }).then(a => {
      a.present();
    });
  }
  sendMsmCode() {
    this.loginService.sendMobileCode(this.mobile).subscribe(res => {
      if (res.Status) {
        this.startDownCount(res.Data.SendInterval);
        this.receiveSmsCodeTime = Math.floor(Date.now() / 100);
        this.expiredInterval = res.Data.ExpiredInterval;
      }
    });
  }
  startDownCount(downCount: number) {
    this.downCount = downCount;
    this.downCountSubscribtion.unsubscribe();
    this.downCountSubscribtion = interval(1000).subscribe(() => {
      this.downCount--;
      console.log(this.downCount);
      if (this.downCount <= 0) {
        setTimeout(() => {
          if (this.downCountSubscribtion) {
            this.downCountSubscribtion.unsubscribe();
          }
        }, 0);
      }
    });
  }
  nextStep() {
    if (this.downCountSubscribtion) {
      this.downCountSubscribtion.unsubscribe();
    }
    console.log(+this.expiredInterval + +this.receiveSmsCodeTime, Math.floor(Date.now() / 1000));
    if (+this.expiredInterval + +this.receiveSmsCodeTime < Math.floor(Date.now() / 1000)) {
      this.alertCtrl.create({ subHeader: "验证码超时，请重新获取验证码" }).then(a => a.present());
      return;
    }
    if (this.checkSmsCode()) {
      this.router.navigate([AppHelper.getRoutePath("account-password"), { validatedBySmsCode: "validatedBySmsCode" }]);
    }
  }
  checkSmsCode() {
    console.log(this.smsCode);
    return this.smsCode;
  }
  ngOnInit() {
  }

}
