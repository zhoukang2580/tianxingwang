import { finalize } from "rxjs/operators";
import { LoginService } from "./../../services/login/login.service";
import { Subscription, interval } from "rxjs";
import { AppHelper } from "./../../appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { TmcService } from "./../../tmc/tmc.service";
import { NavController, IonInput } from "@ionic/angular";
import { CarService } from "./../car.service";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";

@Component({
  selector: "app-rental-car",
  templateUrl: "./rental-car.page.html",
  styleUrls: ["./rental-car.page.scss"]
})
export class RentalCarPage implements OnInit, OnDestroy {
  @ViewChild("mobileInput", { static: false }) mobileInput: IonInput;
  private subscription = Subscription.EMPTY;
  private senSmsCodeSubscription = Subscription.EMPTY;
  private defaultMobile = "";
  mobile: string;
  message: string;
  countDown: number;
  isSending = false;
  fetching = "正在获取默认手机号";
  verifySmsCode = "";
  isMobileVerified = false;
  constructor(
    private carService: CarService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  back() {
    this.navCtrl.pop();
  }
  onBlur() {
    if (!this.mobile) {
      this.mobile = this.defaultMobile;
    }
    this.checkIfMobileVerified();
  }
  private checkIfMobileVerified() {
    if (this.mobile) {
      this.carService.checkIfMobileIsVerified(this.mobile).then(res => {
        this.isMobileVerified = res;
      });
    }
  }
  private startCountDonw(count: number) {
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
  validateCode() {
    if (!this.verifySmsCode) {
      AppHelper.alert("请输入验证码");
      return;
    }
    this.senSmsCodeSubscription = this.carService
      .validateMobileCode(this.mobile, this.verifySmsCode)
      .subscribe(
        res => {
          this.isMobileVerified = res.Status;
          if (res.Message) {
            AppHelper.alert(res.Message);
          }
        },
        e => {
          this.isMobileVerified = false;
          AppHelper.alert(e.Message || e.message || "验证码验证失败");
        }
      );
  }
  sendCode() {
    if (!this.mobile) {
      AppHelper.alert("请输入手机号");
      return;
    }
    if (this.countDown > 0) {
      AppHelper.alert("请稍后再试");
      return;
    }
    this.senSmsCodeSubscription.unsubscribe();
    this.isSending = true;
    this.senSmsCodeSubscription = this.carService
      .sendMobileCode(this.mobile)
      .pipe(
        finalize(() => {
          this.isSending = false;
        })
      )
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
        }
      );
  }
  async onRentalCar() {
    if (!this.mobile) {
      AppHelper.alert("请输入手机号");
      return;
    }
    const url = await this.carService.verifyStaff({ Mobile: this.mobile });
    if (url) {
      this.router.navigate(["open-url"], {
        queryParams: {
          url,
          title: "租车",
          isHideTitle: AppHelper.isDingtalkH5() || AppHelper.isWechatH5()
        }
      });
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe(p => {
      this.getAccountInfo();
    });
  }
  private async getAccountInfo() {
    const info = await this.carService
      .getAccountInfo()
      .catch(_ => ({ Mobile: "" }));
    this.fetching = "";
    if (info) {
      this.defaultMobile = info.Mobile;
      this.mobile = info.Mobile;
    }
    this.checkIfMobileVerified();
  }
}
