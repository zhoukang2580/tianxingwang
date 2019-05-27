import { LoginService } from "./../../services/login/login.service";
import { FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { LanguageHelper } from 'src/app/languageHelper';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: "app-account-email",
  templateUrl: "./account-email.page.html",
  styleUrls: ["./account-email.page.scss"]
})
export class AccountEmailPage implements OnInit {
  action: string;
  isActiveEmail?: boolean;
  isFinish: boolean;
  isModiy: boolean = true;
  countDown = 0;
  form: FormGroup;
  countDownInterval: any;
  isShowImageCode: boolean;
  constructor(private fb: FormBuilder, private identityService: IdentityService,
    private router: Router,
    private navController: NavController,
    private apiService: ApiService) { }

  ngOnInit() {
    this.form = this.fb.group({
      Email: [],
      Code: []
    });
    this.load();
  }
  load() {
    const req = new BaseRequest();
    req.Method = `ApiPasswordUrl-Email-Load`;
    const scription = this.apiService.getResponse<{ Action: string, Email: string, IsActiveEmail?: boolean }>(req)
      .subscribe(r => {
        this.setResult(r);
      }, (e) => {

      }, () => {
        scription.unsubscribe();
      });

  }
  sendAction() {
    const req = new BaseRequest();
    req.Method = `ApiPasswordUrl-Email-Action`;
    req.IsShowLoading = true;
    req.Data = { Email: this.form.value.Email, Code: this.form.value.Code, Action: this.action };
    const scription = this.apiService.getResponse<{ Action: string, Email: string, IsActiveEmail?: boolean }>(req)
      .subscribe(r => {
        if (r.Status && r.Data) {
          if ((r.Data.Action as string).toLowerCase() == "finish") {
            AppHelper.alert(LanguageHelper.getBindEmailSuccess(), true).then(() => {
              this.navController.back();
            });
            return;
          }
          r.Data.Email = "";
          this.form.patchValue({ Code: "" });
        }
        this.setResult(r);

      }, (e) => {
      }, () => {
        scription.unsubscribe();
      });

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
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Email-SendCode";
    req.IsShowLoading = true;
    req.Data = { Email: this.form.value.Email, Action: this.action };
    const sub = this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res => {
      this.startCountDonw(res.Data.SendInterval);
    }, e => {
      AppHelper.alert(e);
    }, () => {
      setTimeout(() => {
        if (sub) {
          sub.unsubscribe();
        }
      }, 100);
    });
  }

}
