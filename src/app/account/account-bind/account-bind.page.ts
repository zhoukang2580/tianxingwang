import { LoginService } from "../../services/login/login.service";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subscription, interval } from "rxjs";
import { ActivatedRoute, Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';
import { ApiService } from 'src/app/services/api/api.service';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { LanguageHelper } from 'src/app/languageHelper';

@Component({
  selector: "app-account-bind",
  templateUrl: "./account-bind.page.html",
  styleUrls: ["./account-bind.page.scss"]
})
export class AccountBindPage implements OnInit, OnDestroy {
  phoneErrorCount = 0;
  countDown = 0;
  countDownInterval: any;
  validImageCodeCount = 0;
  isDisableSendMobileCode = false;
  paramsSubscription = Subscription.EMPTY;
  mobileChangeSubscription = Subscription.EMPTY;
  isMobileNumberOk = false;
  path:string;
  form: FormGroup;
  imgSrc$: Observable<string>;
  bindMobileInfo: {
    Mobile: string;
    IsActiveMobile: boolean;
  } = {} as any;
  constructor(private fb: FormBuilder,   private router: Router,private loginService: LoginService,private apiService: ApiService,
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
        this.path=p.get("Path");
        this.form.patchValue({ Mobile: this.bindMobileInfo.Mobile });
        this.isMobileNumberOk = !!this.bindMobileInfo.Mobile;
      }
    });
    this.refreshImageCode();
    this.mobileChangeSubscription = this.form.controls['Mobile'].valueChanges.subscribe(v => {
      if (v && v.length >= 11) {
        this.isMobileNumberOk = true;
      }
    });
    // this.startCountDonw(160);
  }
  refreshImageCode() {
    this.imgSrc$ = this.loginService.getImage();
  }
  sendSmsCode(){
    const req = new BaseRequest();
    req.Url = AppHelper.getApiUrl() + "/Home/SendIdentityMobileCode";
    req.Data = JSON.stringify({ Mobile: this.form.value.Mobile });
    const sub= this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res=>{
      this.startCountDonw(res.Data.SendInterval);
    },e=>{
      alert(e);
    },()=>{
      setTimeout(() => {
        if(sub){
          sub.unsubscribe();
        }
      }, 100);
    });
  }
  bind(){
    debugger;
    if(!this.form.value.MobileCode)
    {
      alert(LanguageHelper.getMobileCodeTip());
      return;
    }
    if(this.bindMobileInfo.IsActiveMobile)
    {
        this.bindDevice();
    }
    else{
        this.bindMobile();
        this.bindDevice();
    }
  }
  bindMobile()
  {
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Mobile-Bind";
    req.Data = { Mobile: this.form.value.Mobile,MobileCode:this.form.value.MobileCode};
    const sub= this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res=>{
          
    },e=>{
    },()=>{
    });;
    return sub;
  }
  async bindDevice()
  {
    var uuid=await AppHelper.getUUID();
    var name= await AppHelper.getDeviceName();
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Device-Bind";
    req.Data = { Mobile: this.form.value.Mobile,MobileCode:this.form.value.MobileCode,DeviceNumber:uuid,DeviceName:name};
    const sub= this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res=>{
          
    },e=>{
    },()=>{
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
      if(this.countDown==0){
        clearInterval(this.countDownInterval);
      }
    }, 1000);
  }
  jump() { 
    this.router.navigate([AppHelper.getRoutePath(this.path)]);
  }
  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
    this.mobileChangeSubscription.unsubscribe();
  }
}
