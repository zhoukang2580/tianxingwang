import { LoginService } from "../../services/login/login.service";
import { FormGroup, Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { LanguageHelper } from "src/app/languageHelper";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Router } from "@angular/router";
import { NavController } from "@ionic/angular";
import { ApiService } from "src/app/services/api/api.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-account-email-en",
  templateUrl: "./account-email-en.page.html",
  styleUrls: ["./account-email-en.page.scss"],
})
export class AccountEmailEnPage implements OnInit {
  action: string;
  isActiveEmail?: boolean;
  isFinish: boolean;
  isModiy: boolean = true;
  countDown = 0;
  form: FormGroup;
  countDownInterval: any;
  isShowImageCode: boolean;
  isChange = false;
  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private apiService: ApiService
  ) {}
  onChange() {
    this.isChange = true;
  }
  ngOnInit() {
    this.form = this.fb.group({
      Email: [null, Validators.required],
      Code: [null],
    });
    this.load();
  }
  load() {
    const req = new RequestEntity();
    req.Method = `ApiPasswordUrl-Email-Load`;
    const scription = this.apiService
      .getResponse<{ Action: string; Email: string; IsActiveEmail?: boolean }>(
        req
      )
      .subscribe(
        (r) => {
          this.setResult(r);
        },
        (e) => {},
        () => {
          scription.unsubscribe();
        }
      );
  }
  sendAction() {
    const req = new RequestEntity();
    req.Method = `ApiPasswordUrl-Email-Action`;
    req.IsShowLoading = true;
    req.Data = {
      Email: this.form.value.Email,
      Code: this.form.value.Code,
      Action: this.action,
    };
    const scription = this.apiService
      .getResponse<{ Action: string; Email: string; IsActiveEmail?: boolean }>(
        req
      )
      .subscribe(
        (r) => {
          if (r.Status && r.Data) {
            if ((r.Data.Action as string).toLowerCase() == "finish") {
              AppHelper.alert(LanguageHelper.getBindEmailSuccess(), true).then(
                () => {
                  this.back();
                }
              );
              return;
            }
            r.Data.Email = "";
            this.form.patchValue({ Code: "" });
          }
          this.setResult(r);
        },
        (e) => {},
        () => {
          scription.unsubscribe();
        }
      );
  }
  back() {
    this.navController.back();
  }
  setResult(r: any) {
    if (r.Status && r.Data) {
      this.isActiveEmail = r.Data.IsActiveEmail;
      this.form.patchValue({ Email: r.Data.Email });
      this.action = r.Data.Action;
      this.isFinish = (r.Data.Action as string).toLowerCase() == "bind";
      this.isModiy = this.isFinish || !this.isActiveEmail;
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

  sendEmailCode() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Email-SendCode";
    req.IsShowLoading = true;
    req.Data = { Email: this.form.value.Email, Action: this.action };
    const sub = this.apiService
      .getResponse<{
        SendInterval: number;
        ExpiredInterval: number;
      }>(req)
      .subscribe(
        (res) => {
          if (!res.Status && res.Message) {
            AppHelper.alert(res.Message);
            return;
          }
          this.startCountDonw(res.Data.SendInterval);
        },
        (e) => {
          AppHelper.alert(e);
        },
        () => {
          setTimeout(() => {
            if (sub) {
              sub.unsubscribe();
            }
          }, 100);
        }
      );
  }
}
