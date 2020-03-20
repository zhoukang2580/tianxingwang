import { environment } from "src/environments/environment";
import { ConfigEntity } from "./../../services/config/config.entity";
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
import { Platform, ActionSheetController } from "@ionic/angular";
import { ProductItem, ProductItemType } from "src/app/tmc/models/ProductItems";
import { StaffService } from "src/app/hr/staff.service";
import { tap, map } from "rxjs/operators";
import { ORDER_TABS } from "src/app/order/product-list/product-list.page";
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
  isShowWorkflow = environment.mockProBuild;
  defaultAvatar = AppHelper.getDefaultAvatar();
  subscriptions: Subscription[] = [];
  msgCount$: Observable<number>;
  items: ProductItem[] = [];
  isShowMyOrderTabs = true;
  config: ConfigEntity;
  get isShowDeveloperOption() {
    if (
      environment.production &&
      this.staffService.staffCredentials &&
      this.staffService.staffCredentials.find(it =>
        /^450881\d+87x$/gi.test(it.Number)
      )
    ) {
      return true;
    }
    return false;
  }
  constructor(
    private router: Router,
    plt: Platform,
    private identityService: IdentityService,
    private configService: ConfigService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private staffService: StaffService,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.isIos = plt.is("ios");
    this.subscriptions.push(
      this.identityService.getIdentitySource().subscribe(_ => {
        this.Model = null;
      })
    );
  }
  goToWorkflow() {
    this.router.navigate([AppHelper.getRoutePath("workflow-list")]);
  }
  contactUs() {
    this.router.navigate([AppHelper.getRoutePath(`contact-us`)]);
  }
  onDeveloper() {
    this.router.navigate(["developer-options"]);
  }
  private goToProductListPage() {
    this.router.navigate([AppHelper.getRoutePath(`product-list`)]);
  }
  async onLanguageSettings() {
    const cur = AppHelper.getStyle();
    const ash = await this.actionSheetCtrl.create({
      cssClass: "language",
      buttons: [
        {
          text: "English",
          role: cur == "en" ? "selected" : "",
          handler: () => {
            AppHelper.setStorage("style", "en");
            this.reloadPage();
          }
        },
        {
          text: "中文",
          role: !cur ? "selected" : "",
          handler: () => {
            AppHelper.setStorage("style", "");
            this.reloadPage();
          }
        },
        {
          text: "取消",
          role: "destructive",
          handler: () => {
            ash.dismiss();
          }
        }
      ]
    });
    ash.present();
  }
  private reloadPage() {
    this.router.navigate([AppHelper.getRoutePath(this.router.url)]);
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
  goInvitation(){
    this.router.navigate(["hr-invitation-list"]);
  }

  ngOnInit() {
    this.items = ORDER_TABS.filter(it => it.isDisplay);
    if (this.items.length < 4) {
      this.items = this.items.filter(it => it.value != ProductItemType.more);
    }

    this.subscriptions.push(
      this.route.queryParamMap.subscribe(async _ => {
        this.msgCount$ = this.messageService.getMsgCount();
        this.config = await this.configService.getConfigAsync();
        this.load(
          AppHelper.getRouteData() || !this.Model || !this.Model.HeadUrl
        );
        AppHelper.setRouteData(false);
        this.isShowMyOrderTabs =
          true ||
          (await this.staffService.isSelfBookType()) ||
          (await this.staffService.isSecretaryBookType());
        // console.log("can show tabs ", this.isShowMyOrderTabs);
      })
    );
  }

  async load(forceLoad = false) {
    const req = new RequestEntity();
    if (this.Model && !forceLoad) {
      if (this.Model && this.Model.HeadUrl) {
        this.Model.HeadUrl = this.addVersionToUrl(this.Model.HeadUrl);
      }
      return this.Model;
    }
    req.Method = "ApiMemberUrl-Home-Get";
    this.Model = await this.apiService
      .getPromiseData<PageModel>(req)
      .catch(_ => null);
    if (this.Model && this.Model.HeadUrl) {
      this.Model.HeadUrl = this.addVersionToUrl(this.Model.HeadUrl);
    }
    console.log("my load this.model", this.Model);
  }
  private addVersionToUrl(url: string) {
    if (url) {
      url = url.includes("?v")
        ? url.substr(0, url.indexOf("?")) + `?v=${Date.now()}`
        : `${url}?v=${Date.now()}`;
    }
    return url;
  }
  credentialManagement() {
    this.router.navigate([
      AppHelper.getRoutePath("member-credential-list")
    ]);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  goToMyDetail() {
    this.router.navigate([AppHelper.getRoutePath("member-detail")]);
  }
}
