import { AppHelper } from "./../../appHelper";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { ApiService } from 'src/app/services/api/api.service';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
type Item={
  Name:string;
  RealName:string;
  Email:string;
  Mobile:string;
  IsActiveMobile:string;
  IsActionEmail:string;
  IsReality:string;
}
@Component({
  selector: "app-account-security",
  templateUrl: "./account-security.page.html",
  styleUrls: ["./account-security.page.scss"]
})
export class AccountSecurityPage implements OnInit {
  identityEntity: IdentityEntity;
  accountInfo:Item;

  constructor(private router: Router, private identityService: IdentityService,private apiService:ApiService) {
    this.identityService.getIdentity().then(identity => {
      this.identityEntity = identity;
    });
  }
  ngOnInit() {
    this.load();
  }
  load() {
    const req = new BaseRequest();
    req.Method = "ApiAccountUrl-Home-Get";
    let deviceSubscription = this.apiService.getResponse<Item>(req).pipe(map(r => r.Data)).subscribe(r => {
      this.accountInfo = r;
    },()=>{
      if(deviceSubscription)
      {
        deviceSubscription.unsubscribe();
      }
    });
  }
  goToEmailPage() {
    this.router.navigate([AppHelper.getRoutePath("account-email")]);
  }
  goToWeixin() {
    this.router.navigate([AppHelper.getRoutePath("account-wechat")]);
  }
  goToDingding() {
    this.router.navigate([AppHelper.getRoutePath("account-dingtalk")]);
  }
  bindMobile() {
    this.router.navigate([AppHelper.getRoutePath("bind-mobile")]);
  }
  modifyPassword(){
    this.router.navigate([AppHelper.getRoutePath("account-password")]);
  }
  loginDeviceManagement() {
    this.router.navigate([
      AppHelper.getRoutePath("login-device-management")
    ]);
  }
}
