import { LoginService } from "../../services/login/login.service";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subscription, interval } from "rxjs";
import { ActivatedRoute, Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';
import { ApiService } from 'src/app/services/api/api.service';
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { LanguageHelper } from 'src/app/languageHelper';

@Component({
  selector: "app-account-bind",
  templateUrl: "./account-bind.page.html",
  styleUrls: ["./account-bind.page.scss"]
})
export class AccountBindPage implements OnInit, OnDestroy {
  countDown = 0;
  countDownInterval: any;
  isDisableSendMobileCode = false;
  paramsSubscription = Subscription.EMPTY;
  mobileChangeSubscription = Subscription.EMPTY;
  isMobileNumberOk = false;
  path: string;
  form: FormGroup;
  isShowImageCode: boolean;
  bindMobileInfo: {
    Mobile: string;
    IsActiveMobile: boolean;
  } = {} as any;
  constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService, private apiService: ApiService,
    private route: ActivatedRoute) {

  }
  ngOnInit() {

    this.form = this.fb.group({
      Mobile: [],
      ImageCode: [],
      MobileCode: []
    });
    this.paramsSubscription = this.route.paramMap.subscribe(p => {
      if (p) {
        this.bindMobileInfo.IsActiveMobile = p.get("IsActiveMobile") == 'true';
        this.bindMobileInfo.Mobile = p.get("Mobile");
        this.path = p.get("Path");
        this.form.patchValue({ Mobile: this.bindMobileInfo.Mobile });
        this.isMobileNumberOk = !!this.bindMobileInfo.Mobile;
      }
    });

    this.mobileChangeSubscription = this.form.controls['Mobile'].valueChanges.subscribe(v => {
      if (v && `${v}`.length >= 11) {
        this.isMobileNumberOk = true;
      }
    });
    // this.startCountDonw(160);
  }


  sendMobileCode() {
    const req = new RequestEntity();
    req.Url = AppHelper.getApiUrl() + "/Home/SendIdentityMobileCode";
    req.Data = JSON.stringify({ Mobile: this.form.value.Mobile });
    const sub = this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res => {
      if (!res.Status && res.Message) {
        AppHelper.alert(res.Message);
        return;
      }
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
  bind() {
    if (!this.form.value.MobileCode) {
      AppHelper.alert(LanguageHelper.getMobileCodeTip());
      return;
    }
    if (this.bindMobileInfo.IsActiveMobile) {
      this.bindDevice();
    }
    else {
      this.bindMobile();
      this.bindDevice();
    }
  }
  bindMobile() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Mobile-Bind";
    req.Data = { Mobile: this.form.value.Mobile, MobileCode: this.form.value.MobileCode };
    const sub = this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res => {
      if (!res.Status) {
        AppHelper.alert(res.Message);
      }
    }, e => {
      AppHelper.alert(e);
    }, () => {
      sub.unsubscribe();
    });;
    return sub;
  }
  async bindDevice() {
    var uuid = await AppHelper.getDeviceId();
    var name = await AppHelper.getDeviceName();
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Device-Bind";
    req.Data = { Mobile: this.form.value.Mobile, MobileCode: this.form.value.MobileCode, DeviceNumber: uuid, DeviceName: name };
    const sub = this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res => {
      
    }, e => {
    }, () => {
      sub.unsubscribe();
    });;
    return sub;
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
  jump() {
    this.router.navigate([AppHelper.getRoutePath(this.path || "")]);
  }
  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
    this.mobileChangeSubscription.unsubscribe();
  }

}
