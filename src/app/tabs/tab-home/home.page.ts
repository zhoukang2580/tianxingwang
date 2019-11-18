import { FlightService } from 'src/app/flight/flight.service';
import { HotelService } from './../../hotel/hotel.service';
import { TrainService } from 'src/app/train/train.service';
import { StaffEntity } from 'src/app/hr/staff.service';
import { StaffService } from "../../hr/staff.service";
import { Notice, CmsService } from "./../../cms/cms.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { ApiService } from "./../../services/api/api.service";
import { AppHelper } from "src/app/appHelper";
import { Component, OnInit } from "@angular/core";
import { Observable, Subject, BehaviorSubject, from, of } from "rxjs";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { PayService } from "src/app/services/pay/pay.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { tap, shareReplay, map } from "rxjs/operators";
@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements OnInit {
  private intervalIds: any[] = [];
  identity: IdentityEntity;
  aliPayResult$: Observable<any>;
  wxPayResult$: Observable<any>;
  exitAppSub: Subject<number> = new BehaviorSubject(null);
  selectedCompany$: Observable<string>;
  companies: any[];
  agentNotices: { text: string }[];
  canSelectCompany$ = of(false);
  staff: StaffEntity;
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private tmcService: TmcService,
    private apiService: ApiService,
    private payService: PayService,
    private cmsService: CmsService,
    private staffService: StaffService,
    private trainService: TrainService,
    private hotelService: HotelService,
    private flightService: FlightService,
    route: ActivatedRoute
  ) {
    this.staff = null;
    this.selectedCompany$ = tmcService.getSelectedCompanySource();
    route.paramMap.subscribe(async p => {
      this.clearBookInfos();
      this.identity = await this.identityService
        .getIdentityAsync()
        .catch(_ => null);
      // console.log("返回到首页 ",p.keys);
      this.check();
      if (p.get("selectedCompany")) {
        this.tmcService.setSelectedCompany(p.get("selectedCompany"));
      }
    });
    this.canSelectCompany$ = from(this.staffService.isSelfBookType()).pipe(
      map(isSelf => {
        return !isSelf;
      })
    );
  }
  private clearIntervalIds() {
    this.intervalIds.forEach(i => {
      clearInterval(i);
    });
    this.intervalIds = [];
  }
  accountSecurityEn() {
    this.router.navigate(["account-security_en"]);
  }
  goToBulletinList(noticeType?: string) {
    this.router.navigate([AppHelper.getRoutePath('bulletin-list')], {
      queryParams: { bulletinType: noticeType }
    });
  }
  async ngOnInit() {
    const paramters = AppHelper.getQueryParamers();
    if (paramters.wechatPayResultNumber) {
      const req1 = this.apiService.createRequest();
      req1.Method = "TmcApiOrderUrl-Pay-Process";
      req1.Version = "2.0";
      req1.Data = {
        OutTradeNo: paramters.wechatPayResultNumber,
        Type: "3"
      };
      this.payService.process(req1);
    }
  }
  private async getAgentNotices() {
    const agentNotices = await this.cmsService.getAgentNotices(0).catch(_ => [] as Notice[]);
    this.agentNotices = agentNotices.map((notice, index) => {
      return {
        text: `${index + 1}.${notice.Title}`
      }
    });
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
    if (name == 'hotel') {
      route = 'search-hotel';
      if (tmcRegionTypeValue.search("hotel") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == 'train') {
      route = 'search-train';
      if (tmcRegionTypeValue.search("train") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == 'flight') {
      route = 'search-flight';
      if (tmcRegionTypeValue.search("flight") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == 'bulletin') {
      route = 'bulletin-list';
    }
    this.router.navigate([AppHelper.getRoutePath(route)], {
      queryParams: { bulletinType: params }
    });
  }
  private clearBookInfos() {
    this.flightService.removeAllBookInfos();
    this.trainService.removeAllBookInfos();
    this.hotelService.removeAllBookInfos();
  }
  async check() {
    let retryCount = 0;
    console.log("home check");
    try {
      this.getAgentNotices();
      // if (!this.staffService.staffCredentials || this.staffService.staffCredentials.length == 0) {
      //   console.log("需要确认证件信息")
      //   this.router.navigate([AppHelper.getRoutePath("confirm-information")]);
      //   return false;
      // }
      if (this.intervalIds && this.intervalIds.length) {
        this.clearIntervalIds();
      }
      if (!this.staff) {
        retryCount++;
        if (retryCount > 10) {
          this.clearIntervalIds();
          AppHelper.alert("请重新登录!");
          this.router.navigate(["login"]);
          return;
        }
        this.staff = await this.staffService.getStaff();
        const intervalId = setInterval(async () => {
          this.staff = await this.staffService.getStaff();
          if (!this.staff) {
            this.apiService.showLoadingView();
          } else {
            this.apiService.hideLoadingView();
            this.clearIntervalIds();
          }
        }, 2000);
        this.intervalIds.push(intervalId);
      } else {
        this.clearIntervalIds();
      }
      const isSelf = await this.staffService.isSelfBookType();
      if (isSelf) {
        return;
      }
      this.apiService.showLoadingView();
      this.identity = await this.identityService
        .getIdentityAsync()
        .catch(_ => null);
      this.companies = await this.tmcService.getCompanies().catch(_ => []);
      if (
        this.identity &&
        this.identity.Numbers &&
        this.identity.Numbers.AgentId &&
        this.identity.Numbers.TmcId
      ) {
        console.log(this.companies);
      }
      this.apiService.hideLoadingView();
    } catch (e) {
      this.apiService.hideLoadingView();
    }
  }
  onSwitchCustomer() {
    this.router.navigate([AppHelper.getRoutePath("select-customer")]);
  }
  onSwitchCompany() {
    this.router.navigate([AppHelper.getRoutePath("switch-company")]);
  }
  // wechatpay() {
  //   const req = new RequestEntity();
  //   req.Method = "TmcApiOrderUrl-Pay-Create";
  //   req.Version = "2.0";
  //   req.Data = {
  //     Channel: "App",
  //     Type: "3",
  //     OrderId: "190000047133",
  //     IsApp: AppHelper.isApp()
  //   };
  //   this.payService
  //     .wechatpay(req, "")
  //     .then(r => {
  //       const req1 = new RequestEntity();
  //       req1.Method = "TmcApiOrderUrl-Pay-Process";
  //       req1.Version = "2.0";
  //       req1.Data = {
  //         OutTradeNo: r,
  //         Type: "3"
  //       };
  //       this.payService.process(req1);
  //     })
  //     .catch(r => {
  //       AppHelper.alert(r);
  //     });
  // }
  // alipay() {
  //   const req = new RequestEntity();
  //   req.Method = "TmcApiOrderUrl-Pay-Create";
  //   req.Version = "2.0";
  //   req.Data = {
  //     Channel: "App",
  //     Type: "2",
  //     IsApp: AppHelper.isApp(),
  //     OrderId: "190000047133"
  //   };
  //   this.payService
  //     .alipay(req, "")
  //     .then(r => {
  //       const req1 = new RequestEntity();
  //       req1.Method = "TmcApiOrderUrl-Pay-Process";
  //       req1.Version = "2.0";
  //       req1.Data = {
  //         OutTradeNo: r,
  //         Type: "2"
  //       };
  //       this.payService.process(req1);
  //     })
  //     .catch(r => {
  //       AppHelper.alert(r);
  //     });
  // }
}
