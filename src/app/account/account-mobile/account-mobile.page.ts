import { Component, OnInit, OnDestroy } from "@angular/core";
import { IdentityService } from "src/app/services/identity/identity.service";
import { Router } from "@angular/router";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NavController } from "@ionic/angular";
import { LanguageHelper } from "src/app/languageHelper";
import { AppHelper } from "src/app/appHelper";
import { Subscription } from "rxjs";
import { IResponse } from "src/app/services/api/IResponse";

@Component({
  selector: "app-account-mobile",
  templateUrl: "./account-mobile.page.html",
  styleUrls: ["./account-mobile.page.scss"]
})
export class AccountMobilePage implements OnInit, OnDestroy {
  action: string;
  isActiveMobile?: boolean;
  isFinish: boolean;
  isModiy = true;
  countDown = 0;
  form: FormGroup;
  countDownInterval: any;
  senSmsCodeSubscription = Subscription.EMPTY;
  isShowImageCode: boolean;
  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      Mobile: [null, Validators.required],
      Code: [null, Validators.required]
    });
    this.load();
  }
  load() {
    const req = new RequestEntity();
    req.Method = `ApiPasswordUrl-Mobile-Load`;
    const scription = this.apiService
      .getResponse<{
        Action: string;
        Mobile: string;
        IsActiveMobile?: boolean;
      }>(req)
      .subscribe(
        r => {
          this.setResult(r);
        },
        e => { },
        () => {
          scription.unsubscribe();
        }
      );
  }
  async back() {
    await this.navController.pop();
  }
  sendAction() {
    const req = new RequestEntity();
    req.Method = `ApiPasswordUrl-Mobile-Action`;
    req.IsShowLoading = true;
    req.Data = {
      Mobile: this.form.value.Mobile,
      Code: this.form.value.Code,
      Action: this.action
    };
    const scription = this.apiService
      .getResponse<{
        Action: string;
        Mobile: string;
        IsActiveMobile?: boolean;
      }>(req)
      .subscribe(
        r => {
          if (!r.Status) {
            AppHelper.alert("验证码错误!");
            return;
          }
          if (r.Data) {
            if ((r.Data.Action as string).toLowerCase() == "finish") {
              AppHelper.alert(LanguageHelper.getBindMobileSuccess(), true);
              this.back();
              setTimeout(() => {
                if (this.router.url == '/account-mobile') {
                  this.router.navigate([""]);
                }
              }, 300);
              return;
            }
            r.Data.Mobile = "";
            this.form.patchValue({ Code: "" });
          }
          this.setResult(r);
        },
        e => { },
        () => {
          scription.unsubscribe();
        }
      );
  }
  setResult(
    r: IResponse<{ Action: string; Mobile: string; IsActiveMobile?: boolean }>
  ) {
    if (r.Status && r.Data) {
      this.isActiveMobile = r.Data.IsActiveMobile;
      this.form.patchValue({ Mobile: r.Data.Mobile });
      this.action = r.Data.Action;
      this.isFinish = (r.Data.Action as string).toLowerCase() == "bind";
      this.isModiy = this.isFinish || !this.isActiveMobile;
      this.countDown = 0;
    }
  }
  private startCountDonw(countdownTime: number) {
    this.countDown = countdownTime;
    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }
    this.countDownInterval = window.setInterval(() => {
      this.countDown = this.countDown <= 0 ? 0 : this.countDown - 1;
      if (this.countDown == 0) {
        clearInterval(this.countDownInterval);
      }
    }, 1000);
  }

  sendMobileCode() {
    if (this.senSmsCodeSubscription) {
      this.senSmsCodeSubscription.unsubscribe();
    }
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Mobile-SendCode";
    req.IsShowLoading = true;
    req.Data = { Mobile: this.form.value.Mobile, Action: this.action };
    this.senSmsCodeSubscription = this.apiService
      .getResponse<{
        SendInterval: number;
        ExpiredInterval: number;
      }>(req)
      .subscribe(
        res => {
          if (!res.Status && res.Message) {
            AppHelper.alert(res.Message || "请稍后重试");
            return;
          }
          this.startCountDonw(res.Data.SendInterval);
        },
        e => {
          AppHelper.alert(e);
        }
      );
  }
  ngOnDestroy(): void {
    this.senSmsCodeSubscription.unsubscribe();
  }
}
