import { LoginService } from "./../../services/login/login.service";
import { FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { LanguageHelper } from 'src/app/languageHelper';
import { BaseRequest } from 'src/app/services/api/BaseRequest';

@Component({
  selector: "app-account-email",
  templateUrl: "./account-email.page.html",
  styleUrls: ["./account-email.page.scss"]
})
export class AccountEmailPage implements OnInit {
  action:string;
  isActiveMobile?:boolean;
  isFinish:boolean;
  isModiy:boolean;
  countDown = 0;
  form: FormGroup;
  countDownInterval: any;
  constructor(private fb: FormBuilder, private identityService: IdentityService,
    private router: Router,
    private navController:NavController,
    private apiService: ApiService) { }

  ngOnInit() {
    this.form = this.fb.group({
      Mobile: [],
      Code: []
    });
    this.load();
  }
  load()
  {
    const req = new BaseRequest();
    req.Method=`ApiPasswordUrl-Mobile-Load`;
     const scription=this.apiService.getResponse<{Action:string,Mobile:string,IsActiveMobile?:boolean}>(req)
     .subscribe(r=>{
      this.setResult(r);
     },(e)=>{

     },()=>{
      scription.unsubscribe();
     });

  }
  sendAction()
  {
    const req = new BaseRequest();
    req.Method=`ApiPasswordUrl-Mobile-Action`;
    req.IsShowLoading=true;
    req.Data = { Mobile: this.form.value.Mobile,Code: this.form.value.Code,Action:this.action };
     const scription=this.apiService.getResponse<{Action:string,Mobile:string,IsActiveMobile?:boolean}>(req)
     .subscribe(r=>{
      if(r.Status && r.Data)
      {
        r.Data.Mobile="";
        this.form.patchValue({Code:""});
      }
      this.setResult(r);

     },(e)=>{

    },()=>{
     scription.unsubscribe();
    });

  }
  setResult(r:any)
  {
    if(r.Status && r.Data)
    {
      this.isActiveMobile=r.Data.IsActiveMobile;
      this.form.patchValue({Mobile:r.Data.Mobile});
      this.action=r.Data.Action;
      this.isFinish=(r.Data.Action as string).toLowerCase()=="bind";
      this.isModiy=this.isFinish || !this.isActiveMobile;
      this.countDown=0;
      if((r.Data.Action as string).toLowerCase()=="finish")
      {
        alert(LanguageHelper.getBindEmailSuccess(),true).then(()=>{
          this.navController.back();
        });
  
      }
    }
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
  sendMobileCode()
  {
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Mobile-SendCode";
    req.IsShowLoading=true;
    req.Data = { Mobile: this.form.value.Mobile,Action:this.action };
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
 
}
