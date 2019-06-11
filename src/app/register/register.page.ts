import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { AppHelper } from 'src/app/appHelper';
import { ApiService } from 'src/app/services/api/api.service';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LanguageHelper } from 'src/app/languageHelper';
import { LoginService } from '../services/login/login.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  isMobileNumberOk = false;
  isShowImageCode: boolean;
  isCodeOk=false;
  countDown = 0;
  countDownInterval: any;
  form: FormGroup;
  codeSubscription = Subscription.EMPTY;
  mobileChangeSubscription = Subscription.EMPTY;
  mobileNewPasswordSubscription = Subscription.EMPTY;
  mobileSurePasswordSubscription = Subscription.EMPTY;
  constructor( private apiService: ApiService,private loginService: LoginService,private fb: FormBuilder,private router:Router, private navController:NavController) { }

  ngOnInit() {
    this.form = this.fb.group({
      MobileCode: [null], // 手机验证码
      Mobile: [null],// 手机号
      Password:[null],
      SurePassword:[null]
    });
    this.codeSubscription=this.form.controls["Mobile"].valueChanges.subscribe((m: string) => {
      this.isMobileNumberOk = `${m}`.length >= 11;
    });
    this.mobileChangeSubscription=this.form.controls["MobileCode"].valueChanges.subscribe((m: string) => {
      this.isCodeOk = this.form.value.MobileCode && this.form.value.Password && this.form.value.SurePassword;
    });
    this.mobileNewPasswordSubscription=this.form.controls["Password"].valueChanges.subscribe((m: string) => {
      this.isCodeOk = this.form.value.MobileCode && this.form.value.Password && this.form.value.SurePassword;
    });
    this.mobileSurePasswordSubscription=this.form.controls["SurePassword"].valueChanges.subscribe((m: string) => {
      this.isCodeOk = this.form.value.MobileCode && this.form.value.Password && this.form.value.SurePassword;
    });
  }
  showImageCode(type: string) {
  
    this.isShowImageCode = true;
  }
  onSlideEvent(valid: boolean) {
    if (valid) {
      this.isShowImageCode = false;
      this.sendMobileCode();
    }
  }
  sendMobileCode(){
    debugger;
    const req = new RequestEntity();
    req.IsShowLoading=true;
    req.Method = "ApiRegisterUrl-Home-SendMobileCode";
    req.Data = JSON.stringify({ Mobile: this.form.value.Mobile });
    const sub= this.apiService.getResponse<{
      SendInterval?: number;
      ExpiredInterval?: number;
    }>(req).subscribe(res=>{
      if(!res.Status && res.Message)
      {
        AppHelper.alert(res.Message);
        return;
      }
      this.startCountDonw(res.Data.SendInterval);
    },e=>{
      AppHelper.alert(e);
    },()=>{
      setTimeout(() => {
        if(sub){
          sub.unsubscribe();
        }
      }, 100);
    });
  }
  register(){
    if (this.form.value.Password !== this.form.value.SurePassword) {
      AppHelper.alert(LanguageHelper.TwicePasswordNotEqualTip);
      return;
    }
    const req = new RequestEntity();
    req.IsShowLoading=true;
    req.Method = "ApiRegisterUrl-Home-RegisterMobile";
    req.Data = { Mobile: this.form.value.Mobile,MobileCode:this.form.value.MobileCode,Password:this.form.value.Password,SurePassword:this.form.value.SurePassword};
    const sub= this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res=>{
          if(res.Status)
          {
            if(AppHelper.isApp())
            {
              this.bindDevice();
            }
            this.login();
          }
          else if(!res.Status && res.Message)
          {
            AppHelper.alert(res.Message);
            return;
          }
    },e=>{
    },()=>{
      sub.unsubscribe();
    });
  }
  login()
  { 
    const loginEntity = new RequestEntity();
    loginEntity.Data={};
    loginEntity.Data.Name = this.form.value.Mobile;
    loginEntity.Data.Password = this.form.value.Password;
    var sub= this.loginService.login("ApiLoginUrl-Home-Login",loginEntity).subscribe(r => {
      if (!r.Ticket) {
      } else {
        AppHelper.setStorage("loginname", loginEntity.Data.Name);
        this.router.navigate([AppHelper.getRoutePath("")]);
      }
    }, e => {
      this.navController.back();
      AppHelper.alert(e);
      sub.unsubscribe();
    },()=>{
      sub.unsubscribe();
    });
  }
  async bindDevice()
  {
    var uuid=await AppHelper.getDeviceId();
    var name= await AppHelper.getDeviceName();
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Device-Bind";
    req.Data = { Mobile: this.form.value.Mobile,MobileCode:this.form.value.MobileCode,DeviceNumber:uuid,DeviceName:name};
    const sub= this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req).subscribe(res=>{
          
    },e=>{
    },()=>{
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
      if(this.countDown==0){
        clearInterval(this.countDownInterval);
      }
    }, 1000);
  }
  
  ngOnDestroy() {
    this.codeSubscription.unsubscribe();
    this.mobileChangeSubscription.unsubscribe();
    this.mobileNewPasswordSubscription.unsubscribe();
    this.mobileSurePasswordSubscription.unsubscribe();
  }
}
