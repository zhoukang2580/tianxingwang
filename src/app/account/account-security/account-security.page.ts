import { AppHelper } from "./../../appHelper";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
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
  wechatList: { Name: string; }[];
  dingtalkList: { Name: string; }[];
  identityEntity: IdentityEntity;
  identityEntitySubscription = Subscription.EMPTY;
  subscription = Subscription.EMPTY;
  deviceSubscription = Subscription.EMPTY;
  accountInfo: Item;
  isShowDingtalk = AppHelper.isDingtalkH5() || AppHelper.isApp();
  isShowWechat = AppHelper.isWechatH5() || AppHelper.isWechatMini() || AppHelper.isApp();
  constructor(
    private router: Router,
    private identityService: IdentityService,
    private apiService: ApiService,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {
    this.identityEntitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(identity => {
        this.identityEntity = identity;
      });

  }
  private loadDingtalkList() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-DingTalk-List";
    let deviceSubscription = this.apiService
      .getResponse<Item[]>(req)
      .pipe(map(r => r.Data))
      .subscribe(
        r => {
          this.dingtalkList = r;
        },
        () => {
          setTimeout(() => {
            if (deviceSubscription) {
              deviceSubscription.unsubscribe();
            }
          }, 1000);
        }
      );
  }
  private loadWechatList() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Wechat-List";
    let deviceSubscription = this.apiService
      .getResponse<Item[]>(req)
      .pipe(map(r => r.Data))
      .subscribe(
        r => {
          this.wechatList = r;
        },
        () => {
          setTimeout(() => {
            if (deviceSubscription) {
              deviceSubscription.unsubscribe();
            }
          }, 1000);
        }
      );
  }
  back() {
    this.navCtrl.pop();
  }
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe(_ => {
      this.deviceSubscription = this.load();
      this.loadWechatList();
      this.loadDingtalkList();
    });
  }
  ngOnDestroy() {
    this.identityEntitySubscription.unsubscribe();
    this.deviceSubscription.unsubscribe();
    this.subscription.unsubscribe();
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
        () => { }
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
