import { MemberService, MemberCredential } from "../../member/member.service";
import { NavController, DomController, IonSlides } from "@ionic/angular";
import { FlightService } from "src/app/flight/flight.service";
import { HotelService } from "../../hotel/hotel.service";
import { TrainService } from "src/app/train/train.service";
import { StaffEntity } from "src/app/hr/staff.service";
import { StaffService } from "../../hr/staff.service";
import { Notice, CmsService } from "../../cms/cms.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { ApiService } from "../../services/api/api.service";
import { AppHelper } from "src/app/appHelper";
import Swiper from "swiper";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  Renderer2,
  AfterViewInit,
} from "@angular/core";
import {
  Observable,
  Subject,
  BehaviorSubject,
  from,
  of,
  Subscription,
  interval,
} from "rxjs";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { PayService } from "src/app/services/pay/pay.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { tap, shareReplay, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { InternationalHotelService } from "src/app/hotel-international/international-hotel.service";
import { InternationalFlightService } from "src/app/flight-international/international-flight.service";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "src/app/services/config/config.entity";
import { ConfirmCredentialInfoGuard } from "src/app/guards/confirm-credential-info.guard";
import { LoginService } from "src/app/services/login/login.service";
import { LangService } from "src/app/tmc/lang.service";
@Component({
  selector: "app-tmc-home",
  templateUrl: "tmc-home.page.html",
  styleUrls: ["tmc-home.page.scss"],
})
export class TmcHomePage implements OnInit, OnDestroy, AfterViewInit {
  private intervalIds: any[] = [];
  private staffCredentials: MemberCredential[];
  private subscription = Subscription.EMPTY;
  @ViewChild(IonSlides) slidesEle: IonSlides;
  @ViewChild("container", { static: true }) containerEl: ElementRef<
    HTMLElement
  >;
  private exitAppSub: Subject<number> = new BehaviorSubject(null);
  private swiper: any;
  private isLoadingBanners = false;
  identity: IdentityEntity;
  isLoadingNotice = false;
  aliPayResult$: Observable<any>;
  wxPayResult$: Observable<any>;
  selectedCompany$: Observable<string>;
  companies: any[];
  agentNotices: { text: string; active?: boolean; id: number }[];
  canSelectCompany$ = of(false);
  staff: StaffEntity;
  canShow = AppHelper.isApp() || AppHelper.isWechatH5();
  options = {};
  swiperOption: {
    loop: true;
    // autoplay:true,//等同于以下设置
    autoplay: {
      delay: 3000;
      stopOnLastSlide: false;
      disableOnInteraction: true;
    };
  };
  isShowRentalCar = !AppHelper.isWechatMini();
  isShowoverseaHotel = environment.mockProBuild || !environment.production;
  banners: { ImageUrl: string; Title: string; Id: string }[];
  config: ConfigEntity;
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private tmcService: TmcService,
    private apiService: ApiService,
    private payService: PayService,
    private cmsService: CmsService,
    private staffService: StaffService,
    private trainService: TrainService,
    private navCtrl: NavController,
    private memberService: MemberService,
    private hotelService: HotelService,
    private interHotelService: InternationalHotelService,
    private interFlightService: InternationalFlightService,
    private flightService: FlightService,
    route: ActivatedRoute,
    private configService: ConfigService,
    private loginService: LoginService,
    private langService: LangService
  ) {
    this.staff = null;
    this.selectedCompany$ = tmcService.getSelectedCompanySource();
    route.queryParamMap.subscribe(async (p) => {
      // this.updateSwiper();
      this.clearBookInfos();
      this.check();
      this.canSelectCompany$ = from(this.staffService.isSelfBookType()).pipe(
        map((isSelf) => {
          return !isSelf;
        })
      );
      if (p.get("selectedCompany")) {
        this.tmcService.setSelectedCompanySource(p.get("selectedCompany"));
      }
      this.identity = await this.identityService
        .getIdentityAsync()
        .catch((_) => null);
      await this.loginService.checkIfForceAction();
      // console.log("返回到首页 ",p.keys);
      this.langService.translate();
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.destroySwiper();
  }
  private async loadBanners() {
    if (!this.banners || this.banners.length == 0) {
      if (!(await this.hasTicket())) {
        return;
      }
      if (this.isLoadingBanners) {
        return;
      }
      this.isLoadingBanners = true;
      this.tmcService
        .getBanners()
        .catch(() => [])
        .then((res) => {
          this.banners = res || [];
          this.updateSwiper();
        })
        .finally(() => {
          this.isLoadingBanners = false;
        });
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.updateSwiper();
    }, 200);
  }
  private destroySwiper() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
  private clearIntervalIds() {
    this.intervalIds.forEach((i) => {
      clearInterval(i);
    });
    this.intervalIds = [];
  }
  accountSecurityEn() {
    this.router.navigate(["account-security_en"]);
  }
  goToBulletinList(noticeType?: string) {
    this.router.navigate([AppHelper.getRoutePath("bulletin-list")], {
      queryParams: { bulletinType: noticeType },
    });
  }
  private async initializeSelfBookInfos() {
    try {
      const staff = await this.staffService.getStaff(false);
      // if (staff) {
      //   await this.hotelService.initSelfBookTypeBookInfos(false);
      //   await this.flightService.initSelfBookTypeBookInfos(false);
      //   await this.trainServive.initSelfBookTypeBookInfos(false);
      // }
    } catch (e) {}
  }
  onSlideTouchEnd() {
    if (this.slidesEle) {
      this.slidesEle.startAutoplay();
    }
  }
  private initSwiper() {
    this.options = {
      loop: true,
      autoplay: {
        delay: 3000,
      },
      speed: 1000,
      direction: "vertical",
      freeMode: true,
      isShowText: true,
    };
    if (this.containerEl && this.containerEl.nativeElement) {
      this.swiper = new Swiper(this.containerEl.nativeElement, {
        loop: true,
        // autoplay:true,//等同于以下设置
        autoplay: {
          delay: 3000,
          stopOnLastSlide: false,
          disableOnInteraction: true,
        },
      });
      this.swiper.on("touchEnd", () => {
        this.onTouchEnd();
      });
    }
  }
  async ngOnInit() {
    this.initSwiper();
    this.subscription = this.identityService
      .getIdentitySource()
      .subscribe((_) => {
        this.configService.getConfigAsync().then((c) => {
          this.config = c;
        });
        this.banners = [];
        this.staffCredentials = null;
        this.loadBanners();
        this.loadNotices();
      });
    const paramters = AppHelper.getQueryParamers();
    if (paramters.wechatPayResultNumber) {
      const req1 = this.apiService.createRequest();
      req1.Method = "TmcApiOrderUrl-Pay-Process";
      req1.Version = "2.0";
      req1.Data = {
        OutTradeNo: paramters.wechatPayResultNumber,
        Type: "3",
      };
      this.payService.process(req1);
    }
    if (await this.hasTicket()) {
      this.initializeSelfBookInfos();
    }
  }
  private onTouchEnd() {
    // console.log("touchEnd");
    setTimeout(() => {
      this.startAutoPlay();
    }, 2000);
  }
  private startAutoPlay() {
    if (this.swiper && this.swiper.autoplay && this.swiper.autoplay.start) {
      this.swiper.autoplay.start();
    }
  }

  private async getAgentNotices() {
    if (!(await this.hasTicket())) {
      return;
    }
    const agentNotices = await this.cmsService
      .getAgentNotices(0)
      .catch((_) => [] as Notice[]);
    this.agentNotices = agentNotices.map((notice, index) => {
      return {
        text: `${notice.Title}`,
        id: index,
        active: index == 0,
      };
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
  private async clearBookInfos() {
    this.tmcService.clearTravelFormNumber();
    if (await this.hasTicket()) {
      this.flightService.removeAllBookInfos();
      this.trainService.removeAllBookInfos();
      this.hotelService.removeAllBookInfos();
      this.interFlightService.removeAllBookInfos();
      this.interHotelService.removeAllBookInfos();
    }
  }
  private async hasTicket() {
    this.identity = await this.identityService.getIdentityAsync();
    return this.identity && !!this.identity.Ticket;
  }
  private updateSwiper() {
    if (this.swiper) {
      setTimeout(() => {
        this.swiper.update();
        this.startAutoPlay();
      }, 2000);
    }
  }
  private async loadNotices() {
    if (!this.agentNotices || !this.agentNotices.length) {
      if (this.isLoadingNotice) {
        return;
      }
      if (!(await this.hasTicket())) {
        return;
      }
      this.agentNotices = [];
      this.isLoadingNotice = true;
      this.getAgentNotices().finally(() => {
        this.isLoadingNotice = false;
      });
    }
  }
  async check() {
    if (!(await this.hasTicket())) {
      return;
    }
    let retryCount = 0;
    try {
      this.loadNotices();
      this.loadBanners();
      this.staff = await this.staffService.getStaff();
      console.log("home check", this.staffCredentials);
      if (this.staff && this.staff.AccountId) {
        this.staffCredentials = await this.staffService.getStaffCredentials(
          this.staff.AccountId
        );
        if (!this.staffCredentials || !this.staffCredentials.length) {
          this.staffCredentials = await this.memberService.getCredentials(
            this.staff.AccountId
          );
        }
        if (!this.staffCredentials || !this.staffCredentials.length) {
          console.log("需要确认证件信息");
          this.router.navigate([AppHelper.getRoutePath("confirm-information")]);
          return false;
        }
      }
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
            this.apiService.showLoadingView({ msg: "正在初始化，请稍候" });
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
      this.apiService.showLoadingView({ msg: "正在初始化..." });
      this.identity = await this.identityService
        .getIdentityAsync()
        .catch((_) => null);
      if (
        this.identity &&
        this.identity.Numbers &&
        this.identity.Numbers.AgentId &&
        this.identity.Numbers.TmcId
      ) {
        this.companies = await this.tmcService.getCompanies().catch((_) => []);
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
