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
import { StaffService, StaffEntity } from "src/app/hr/staff.service";
import { tap, map } from "rxjs/operators";
import { TmcService } from "src/app/tmc/tmc.service";
import { ORDER_TABS } from "src/app/order/product-list/product-list.page";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { LangService } from "src/app/tmc/lang.service";
interface PageModel {
  Name: string;
  RealName: string;
  Mobile: string;
  HeadUrl: string;
}
@Component({
  selector: "app-my",
  templateUrl: "my.page.html",
  styleUrls: ["my.page.scss"],
})
export class MyPage implements OnDestroy, OnInit {
  private identity: IdentityEntity;
  Model: PageModel;
  isIos = false;
  isShowWorkflow = environment.mockProBuild;
  defaultAvatar = AppHelper.getDefaultAvatar();
  subscriptions: Subscription[] = [];
  msgCount$: Observable<number>;
  items: ProductItem[] = [];
  isShowMyOrderTabs = true;
  config: ConfigEntity;
  isAgent = false;
  staff: StaffEntity;
  get isShowDeveloperOption() {
    if (
      (environment.production &&
        this.staffService.staffCredentials &&
        this.staffService.staffCredentials.find((it) =>
          /^450881\d+87x$/gi.test(it.Number)
        )) ||
      (environment.mockProBuild &&
        this.Model &&
        (this.Model.Mobile == "18817392136" ||
          this.Model.RealName == "黄满标" ||
          this.Model.Name == "黄满标" ||
          this.Model.Name == "T163G996"))
    ) {
      return true;
    }
    return false;
  }
  constructor(
    private router: Router,
    plt: Platform,
    private tmcService: TmcService,
    private identityService: IdentityService,
    private configService: ConfigService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private staffService: StaffService,
    private actionSheetCtrl: ActionSheetController,
    private langService: LangService
  ) {
    this.isIos = plt.is("ios");
    this.subscriptions.push(
      this.identityService.getIdentitySource().subscribe((identity) => {
        this.isAgent =
          identity && identity.Numbers && !!identity.Numbers.AgentId;
        this.Model = null;
        this.staffService.getStaff().then((s) => {
          this.staff = s;
        });
      })
    );
  }
  goToWorkflow() {
    this.router.navigate([AppHelper.getRoutePath("workflow-list")]);
  }
  goBusiness() {
    this.router.navigate([AppHelper.getRoutePath("business-list")]);
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
    const style = AppHelper.getStyle();
    const ash = await this.actionSheetCtrl.create({
      cssClass: "language",
      buttons: [
        {
          text: "English",
          role: style == "en" ? "selected" : "",
          handler: () => {
            AppHelper.setStyle("en");
            this.reloadPage();
          },
        },
        {
          text: "中文",
          role: !style ? "selected" : "",
          handler: () => {
            AppHelper.setStyle("cn");
            this.reloadPage();
          },
        },
        {
          text: "取消",
          role: "destructive",
          handler: () => {
            ash.dismiss();
          },
        },
      ],
    });
    ash.present();
  }
  async goToPage(name: string, params?: any) {
    const tmc = await this.tmcService.getTmc();
    const msg = "您没有预订权限";
    if (!tmc || !tmc.RegionTypeValue) {
      AppHelper.alert(msg);
      return;
    }
    let route = "";

    const tmcRegionTypeValue = tmc.RegionTypeValue.toLowerCase();
    if (name == "international-flight") {
      route = "search-international-flight";
      if (tmcRegionTypeValue.search("internationalflight") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "international-hotel") {
      route = "search-international-hotel";
      if (tmcRegionTypeValue.search("internationalhot") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "hotel") {
      route = "search-hotel";
      if (tmcRegionTypeValue.search("hotel") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "train") {
      route = "search-train";
      if (tmcRegionTypeValue.search("train") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "flight") {
      route = "search-flight";
      if (tmcRegionTypeValue.search("flight") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "rentalCar") {
      route = "rental-car";
      if (tmcRegionTypeValue.search("car") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "bulletin") {
      route = "bulletin-list";
    }
    this.router.navigate([AppHelper.getRoutePath(route)], {
      queryParams: { bulletinType: params },
    });
  }
  private reloadPage() {
    this.router
      .navigate([AppHelper.getRoutePath(this.router.url)], { replaceUrl: true })
      .then(() => {
        this.langService.translate();
      });
  }
  onProductClick(tab: ProductItem) {
    if (tab.value != ProductItemType.more) {
      this.goToProductTabsPage(tab);
    } else {
      this.goToProductListPage();
    }
  }
  private goToProductTabsPage(tab: ProductItem) {
    this.router.navigate([AppHelper.getRoutePath(`order-list`)], {
      queryParams: { tabId: tab.value },
    });
  }
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }
  goTomessageList() {
    this.router.navigate([AppHelper.getRoutePath("message-list")]);
  }
  goInvitation() {
    this.router.navigate(["hr-invitation-list"]);
  }

  ngOnInit() {
    this.items = ORDER_TABS.filter((it) => it.isDisplay);
    this.items = this.items.filter(
      (it) =>
        it.value != ProductItemType.more &&
        it.value != ProductItemType.waitingApprovalTask
    );

    this.subscriptions.push(
      this.route.queryParamMap.subscribe(async (_) => {
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
      .catch((_) => null);
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
    this.router.navigate([AppHelper.getRoutePath("member-credential-list")]);
  }
  PendingTasks() {
    this.router.navigate([AppHelper.getRoutePath("approval-task")]);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  goToMyDetail() {
    this.router.navigate([AppHelper.getRoutePath("member-detail")]);
  }
}
