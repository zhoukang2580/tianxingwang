import { AppHelper } from 'src/app/appHelper';
import { Component, OnInit } from "@angular/core";
import { Observable, of, Subject, BehaviorSubject, throwError } from "rxjs";
import * as moment from "moment";
import { catchError } from "rxjs/operators";
import {
  AlertController,
  ModalController
} from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { FileHelperService } from 'src/app/services/file-helper.service';
import { LanguageHelper } from 'src/app/languageHelper';
@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements OnInit {
  aliPayResult$: Observable<any>;
  wxPayResult$: Observable<any>;
  exitAppSub: Subject<number> = new BehaviorSubject(null);
  // day1 = new DayModel();
  // day2 = new DayModel();
  constructor(
    // private appSer: AppCommonService,
    // private pay: PayService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private router: Router,
  ) { }
  accountSecurityEn() {
    this.router.navigate(["account-security_en"]);
  }

  aliPay() {
    this.router.navigate(["setting_en"]);
    // tslint:disable-next-line:max-line-length
    // const orderInfo = `app_id=2017101309278133&biz_content=%7b%22subject%22%3a%22%e6%94%af%e4%bb%98%e5%ae%9d%22%2c%22body%22%3a%22%e6%94%af%e4%bb%98%e5%ae%9d%22%2c%22timeout_express%22%3a%2210m%22%2c%22out_trade_no%22%3a%228b14275cb4f8462f9074a247fb5a7174%22%2c%22total_amount%22%3a%221%22%2c%22product_code%22%3a%22QUICK_MSECURITY_PAY%22%2c%7d&charset=UTF-8&format=json&method=alipay.trade.app.pay&notify_url=http%3a%2f%2fpay.sky-trip.com%2fAliPay%2fNotify&return_url=http%3a%2f%2fpay.sky-trip.com%2fAliPay%2fProcess&sign_type=RSA2&timestamp=2018-08-01+10%3a58%3a24&version=1.0&sign=D1ivqfBOKq90JuL%2bzF30JdDIWfas2ixioIZ4cgH8CGweZ%2f5V799dkGC%2frDYZeuLUN%2fO%2bqGUsuZx6fRsS3KvJUklyqKK7dzatVwiz1se6mDQeeV5y%2b%2fnDJni1wtlG2wq%2b1TUQMtURoKdX2AC9gveSGTnbSn%2fmYtDs3fn40EX3ec%2fRmVYVpC%2f2zQlpZDHW7zqHbs6HOW2646zUaYvbZiEkyzYjgTb3fqVvxUqJWb8sUFzFQAzo6fGI%2ftluYDFMl6bLvnf6Icqe2sFPR2TEFKl2VrFkVQyjF2mMIx45CYIAPPzybctTejpURzSfk1bMkx5lIjSgb%2fXav3xxDLhURAjwoA%3d%3d`;
    // this.aliPayResult$ = this.pay
    //   .aliPay({ value: orderInfo })
    //   .pipe(catchError(e => of(e)));
  }
  wxPay() {
    // tslint:disable-next-line:max-line-length
    // const url = `http://test.order.api.ct.testskytrip.com/pay/create?ticket=034de3c35501413fadbeb9e274e201b3&Channel=Mobile&Type=3&OrderId=190000000001`;
    // this.wxPayResult$ = this.pay.wxPay(url).pipe(
    //   catchError((e: Error) => {
    //     console.dir(e);
    //     return of(e.message);
    //   })
    // );
  }
  ngOnInit(): void {
  }
  // selectDate() {
  // this.router.navigate([{outlets:{selectDatetime:['select-datetime']}}]);
  //   if (!this.day1.date) {
  //     const curDay = moment();
  //     this.day1.date = curDay.format("YYYY-MM-DD");
  //     this.day1.day = curDay.date() + "";
  //     this.day1.selected = true;
  //     this.day1.enabled = true;
  //     this.day1.timeStamp = Math.floor(+curDay / 1000);
  //     const day2 = moment().add(2, "days");
  //     this.day2.date = day2.format("YYYY-MM-DD");
  //     this.day2.day = day2.date() + "";
  //     this.day2.timeStamp = Math.floor(+day2 / 1000);
  //   }
  // this.appSer
  //   .presentModal({
  //     component: SelectDatetimePage,
  //     showBackdrop: true,
  //     backdropDismiss: false,
  //     componentProps: {
  //       selectedDays: [this.day1, this.day2],
  //       title: "酒店入住"
  //     }
  //   })
  //   .then(modal => {
  //     modal.present();
  //     modal.onWillDismiss().then(res => {
  //       const result = res.data as DayModel[];
  //       console.log(result.map(d => d.date));
  //       this.day1 = result[0];
  //       this.day2 = result[result.length - 1];
  //     });
  //   });
  // }

}
