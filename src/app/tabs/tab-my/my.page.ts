import { MessageService } from "./../../message/message.service";
import { AppHelper } from "src/app/appHelper";
import { Component, OnInit } from "@angular/core";

import { OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { ConfigService } from "src/app/services/config/config.service";
import { Subscription, Observable, of, from, combineLatest } from "rxjs";
import { Platform } from "@ionic/angular";
import { ProductItem, ProductItemType } from "src/app/tmc/models/ProductItems";
import { ORDER_TABS } from "src/app/order/product-tabs/product-tabs.page";
import { StaffService } from "src/app/hr/staff.service";
import { tap, map } from "rxjs/operators";
interface PageModel {
  Name: string;
  RealName: string;
  Mobile: string;
  HeadUrl: string;
}
@Component({
  selector: "app-my",
  templateUrl: "my.page.html",
  styleUrls: ["my.page.scss"]
})
export class MyPage implements OnDestroy, OnInit {
  Model: PageModel;
  isIos = false;
  defaultAvatar = AppHelper.getDefaultAvatar();
  subscription = Subscription.EMPTY;
  identitySubscription = Subscription.EMPTY;
  msgCount$: Observable<number>;
  items: ProductItem[] = [];
  isShowMyOrderTabs = false;
  constructor(
    private router: Router,
    plt: Platform,
    private identityService: IdentityService,
    private configService: ConfigService,
    private apiService: ApiService,
    route: ActivatedRoute,
    private messageService: MessageService,
    private staffService: StaffService
  ) {
    this.isIos = plt.is("ios");
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(identity => {
        if (!identity || !identity.Ticket) {
          console.log("my page identity ", identity);
          this.Model = null;
        }
      });
    route.paramMap.subscribe(async _ => {
      this.load();
      this.isShowMyOrderTabs =
        (await this.staffService.isSelfBookType()) ||
        (await this.staffService.isSecretaryBookType());
      console.log("can show tabs ", this.isShowMyOrderTabs);
    });
  }
  private goToProductListPage() {
    this.router.navigate([AppHelper.getRoutePath(`product-list`)]);
  }
  onProductClick(tab: ProductItem) {
    if (tab.value != ProductItemType.more) {
      this.goToProductTabsPage(tab);
    } else {
      this.goToProductListPage();
    }
  }
  private goToProductTabsPage(tab: ProductItem) {
    this.router.navigate([AppHelper.getRoutePath(`product-tabs`)], {
      queryParams: { tabId: tab.value }
    });
  }
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }
  goTomessageList() {
    this.router.navigate([AppHelper.getRoutePath("message-list")]);
  }

  ngOnInit() {

    this.items = ORDER_TABS.filter(it => it.isDisplay);
    if (this.items.length < 4) {
      this.items = this.items.filter(it => it.value != ProductItemType.more);
    }
    this.msgCount$ = this.messageService.getMsgCount();
    console.log("my ngOnInit");
    // this.Model = {
    //   Name: "",
    //   RealName: "",
    //   Mobile: "",
    //   HeadUrl: ""
    // };
  }

  async load() {
    console.log("my load this.model", this.Model);
    const req = new RequestEntity();
    if (this.Model) {
      return this.Model;
    }
    req.Method = "ApiMemberUrl-Home-Get";
    const r = await this.apiService.getPromiseData<PageModel>(req);
    const config = await this.configService.get();
    console.log("my load ApiMemberUrl-Home-Get", r);
    this.Model = { ...this.Model, ...r };
    if (this.Model && !this.Model.HeadUrl) {
      this.Model.HeadUrl = config.DefaultImageUrl;
    }
  }
  credentialManagement() {
    this.router.navigate([
      AppHelper.getRoutePath("member-credential-management")
    ]);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.identitySubscription.unsubscribe();
  }
  goToMyDetail() {
    this.router.navigate([AppHelper.getRoutePath("member-detail")]);
  }
}
