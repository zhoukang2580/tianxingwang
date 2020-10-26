import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { Platform, ActionSheetController } from '@ionic/angular';
import { Subscription, Observable } from 'rxjs';
import { AppHelper } from 'src/app/appHelper';
import { StaffEntity, StaffService } from 'src/app/hr/staff.service';
import { PageModel } from 'src/app/member/member.service';
import { MessageService } from 'src/app/message/message.service';
import { ORDER_TABS } from 'src/app/order/product-list/product-list.page';
import { ApiService } from 'src/app/services/api/api.service';
import { ConfigEntity } from 'src/app/services/config/config.entity';
import { ConfigService } from 'src/app/services/config/config.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { LangService } from 'src/app/services/lang.service';
import { ProductItem, ProductItemType } from 'src/app/tmc/models/ProductItems';
import { TmcService } from 'src/app/tmc/tmc.service';
import { environment } from 'src/environments/environment';

import { MyPage } from '../tab-my/my.page';
@Component({
  selector: "app-my_en",
  templateUrl: "my_en.page.html",
  styleUrls: ["my_en.page.scss"],
})
export class MyEnPage implements OnDestroy, OnInit {
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
    public router: Router,
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
    this.Model = await this.tmcService.getMemberDetail().catch(() => null);
    if (this.Model && forceLoad) {
      this.Model.HeadUrl = this.addVersionToUrl(this.Model.HeadUrl);
    }
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
