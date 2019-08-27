import { AppHelper } from "./../../appHelper";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { NavController } from "@ionic/angular";
interface Item {
  Name: string;
  RealName: string;
  Email: string;
  Mobile: string;
  IsActiveMobile: string;
  IsActionEmail: string;
  IsReality: string;
}
@Component({
  selector: "app-account-security",
  templateUrl: "./account-security.page.html",
  styleUrls: ["./account-security.page.scss"]
})
export class AccountSecurityPage implements OnInit, OnDestroy {
  identityEntity: IdentityEntity;
  identityEntitySubscription = Subscription.EMPTY;
  deviceSubscription = Subscription.EMPTY;
  accountInfo: Item;

  constructor(
    private router: Router,
    private identityService: IdentityService,
    private apiService: ApiService,
    private navCtrl: NavController
  ) {
    this.identityEntitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(identity => {
        this.identityEntity = identity;
      });
  }
  back() {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.deviceSubscription = this.load();
  }
  ngOnDestroy() {
    this.identityEntitySubscription.unsubscribe();
    this.deviceSubscription.unsubscribe();
  }
  load() {
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Home-Get";
    return this.apiService
      .getResponse<Item>(req)
      .pipe(map(r => r.Data))
      .subscribe(
        r => {
          this.accountInfo = r;
        },
        () => {}
      );
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
    this.router.navigate([AppHelper.getRoutePath("account-mobile")]);
  }
  modifyPassword() {
    this.router.navigate([AppHelper.getRoutePath("account-password")]);
  }
  loginDeviceManagement() {
    this.router.navigate([AppHelper.getRoutePath("account-device")]);
  }
}
