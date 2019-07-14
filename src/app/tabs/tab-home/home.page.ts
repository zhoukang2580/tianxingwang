import { HrService } from "../../hr/staff.service";
import { Notice, CmsService } from "./../../cms/cms.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { ApiService } from "./../../services/api/api.service";
import { AppHelper } from "src/app/appHelper";
import { Component, OnInit } from "@angular/core";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { PayService } from "src/app/services/pay/pay.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { tap, shareReplay } from "rxjs/operators";
@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements OnInit {
  identity$: Observable<IdentityEntity>;
  aliPayResult$: Observable<any>;
  wxPayResult$: Observable<any>;
  exitAppSub: Subject<number> = new BehaviorSubject(null);
  selectedCompany$: Observable<string>;
  companies: any[];
  agentNotices: Notice[];
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private tmcService: TmcService,
    private apiService: ApiService,
    private payService: PayService,
    private cmsService: CmsService,
    private hrService: HrService,
    route: ActivatedRoute
  ) {
    this.selectedCompany$ = tmcService.getSelectedCompany();
    route.paramMap.subscribe(p => {
      // console.log("返回到首页 ",p.keys);
      this.check();
      if (p.get("selectedCompany")) {
        this.tmcService.setSelectedCompany(p.get("selectedCompany"));
      }
    });
  }
  accountSecurityEn() {
    this.router.navigate(["account-security_en"]);
  }
  goToBulletinList(noticeType?: string) {
    this.router.navigate([AppHelper.getRoutePath("bulletin-list")], {
      queryParams: { bulletinType: noticeType }
    });
  }
  ngOnInit(): void {
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
    this.identity$ = this.identityService.getIdentity().pipe(
      shareReplay(),
      tap(id => {
        console.log("home page get identity ", id);
      })
    );
    // this.check();
    // this.router.events.subscribe(evt => {
    // console.log(evt);
    //   if (evt instanceof NavigationEnd) {
    //     if (evt.url.includes("tabs/home")) {
    //       console.log(evt);
    //       this.check();
    //     }
    //   }
    // });
    this.getAgentNotices();
  }
  async getAgentNotices() {
    this.agentNotices = await this.cmsService.getAgentNotices(0);
  }
  async check() {
    console.log("home check");
    try {
      this.apiService.showLoadingView();
      this.companies = await this.tmcService.getCompanies();
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
  //   let req = this.apiService.createRequest();
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
  //       let req1 = this.apiService.createRequest();
  //       req1.Method = "TmcApiOrderUrl-Pay-Process";
  //       req1.Version = "2.0";
  //       req1.Data = {
  //         OutTradeNo: r,
  //         Type: "3"
  //       };
  //       this.payService.process(req1);
  //     })
  //     .catch(r => {});
  // }
  // alipay() {
  //   let req = this.apiService.createRequest();
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
  //       let req1 = this.apiService.createRequest();
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
