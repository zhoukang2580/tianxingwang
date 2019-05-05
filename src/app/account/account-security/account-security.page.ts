import { AppHelper } from "./../../appHelper";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';

@Component({
  selector: "app-account-security",
  templateUrl: "./account-security.page.html",
  styleUrls: ["./account-security.page.scss"]
})
export class AccountSecurityPage implements OnInit {
  identityEntity: IdentityEntity;
  constructor(private router: Router, private identityService: IdentityService) {
    this.identityService.getIdentity().then(identity => {
      this.identityEntity = identity;
    });
  }

  ngOnInit() { }
  goToEmailPage() {
    this.router.navigate([AppHelper.getRoutePath("account-email")]);
  }
  goToWeixin() {
    this.router.navigate([AppHelper.getRoutePath("account-weixin")]);
  }
  goToDingding() {
    this.router.navigate([AppHelper.getRoutePath("account-dingding")]);
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
