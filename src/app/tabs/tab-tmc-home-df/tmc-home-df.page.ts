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
import { tap, shareReplay, map, finalize } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { InternationalHotelService } from "src/app/hotel-international/international-hotel.service";
import { InternationalFlightService } from "src/app/flight-international/international-flight.service";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "src/app/services/config/config.entity";
import { ConfirmCredentialInfoGuard } from "src/app/guards/confirm-credential-info.guard";
import { LoginService } from "src/app/services/login/login.service";
import { CONFIG } from "src/app/config";
import { LangService } from "src/app/services/lang.service";
import { ProductItem } from "src/app/tmc/models/ProductItems";
import { error } from "protractor";
import { HotelDayPriceEntity } from "src/app/hotel/models/HotelDayPriceEntity";
import { MapService } from "src/app/services/map/map.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
@Component({
  selector: "app-tmc-home",
  templateUrl: "tmc-home-df.page.html",
  styleUrls: ["tmc-home-df.page.scss"],
})
export class TmcHomeDfPage implements OnInit, OnDestroy, AfterViewInit {
  private intervalIds: any[] = [];
  private staffCredentials: MemberCredential[];
  private subscription = Subscription.EMPTY;
  private curCity: TrafficlineEntity;
  private isLoadingHotHotels = false;
  private isLoadingReviewedTask = false;
  @ViewChild(IonSlides) slidesEle: IonSlides;
  @ViewChild("container", { static: true })
  containerEl: ElementRef<HTMLElement>;
  @ViewChild("hothotel", { static: true }) hothotelEl: ElementRef<HTMLElement>;
  @ViewChild("announcementEl", { static: true })
  announcementEl: ElementRef<HTMLElement>;
  @ViewChild("taskEle", { static: true }) taskEle: ElementRef<HTMLElement>;
  @ViewChild("tripEle", { static: true }) tripEle: ElementRef<HTMLElement>;
  private exitAppSub: Subject<number> = new BehaviorSubject(null);
  private bannersSwiper: any;
  private hotelsSwiper: any;
  private announcementElSwiper: any;
  private taskEleSwiper: any;
  private tripEleSwiper: any;
  private isLoadingBanners = false;
  private isLoadingMyItinerary = false;
  private isLoadingHotelBanners = false;
  private isOpenUrl = false;
  identity: IdentityEntity;
  isLoadingNotice = false;
  isAgent = false;
  isCanDailySigned = true;
  isRegister = true;
  aliPayResult$: Observable<any>;
  wxPayResult$: Observable<any>;
  selectedCompany: string;
  companies: any[];
  agentNotices: { text: string; active?: boolean; id: number }[];
  canSelectCompany = false;
  staff: StaffEntity;
  canShow = AppHelper.isApp() || AppHelper.isWechatH5();
  // options = {};
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
  isShowoverseaFlight = CONFIG.mockProBuild;
  banners: { ImageUrl: string; Title: string; Id: string }[];
  boutiqueHotel: {
    HotelDayPrices: {
      HotelFileName: string;
      Id: string;
    }[];
    HotelDefaultImg: string;
  };
  hothotels: {
    PageIndex: number;
    PageSize: number;
    CityCode: string;
    SearchDate: string;
  };
  integralRegion: {
    Tag: string;
    PageSize: number;
  };

  sign: {
    Amount: number;
    Name: string;
  };

  exchangeList: {
    Id: string;
    Name: string;
    ImageUrl: string;
    Count: string;
  };

  itineraryList: {
    Id: String;
    EndTime: String;
    StartTime: String;
    FromName: String;
    ToName: String;
    PassagerId: String;
    Type: any;
    OrderId: String;
    Hour: Number;
    Name: String;
    PassagerName: String;
    FromCityName: String;
  }[];

  tasklist: {
    Name: String;
    saName: String;
    Hour: String;
    StatusName: String;
    Variables: any;
    VariablesObj: any;
  }[];
  config: ConfigEntity;
  activeTab: ProductItem;
  curIndex = 0;
  hotIndex = 0;
  constructor(
    private mapService: MapService,
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
    private langService: LangService // private appHelper:AppHelper
  ) {
    this.staff = null;
    route.queryParamMap.subscribe(async (p) => {
      // this.updateSwiper();
      this.clearBookInfos();
      this.check();
      this.isAgent = this.tmcService.isAgent;
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
  goBusiness() {
    this.router.navigate([AppHelper.getRoutePath("business-list")]);
  }

  onDemand() {
    this.router.navigate([AppHelper.getRoutePath("demand-list")]);
  }
  private async loadBanners() {
    if (!this.banners || !this.banners.length) {
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

  private async getRecommendHotel() {
    if (this.isLoadingHotHotels) {
      return;
    }
    var myDate = new Date();
    this.hothotels = {
      PageIndex: 0,
      PageSize: 20,
      CityCode: (this.curCity && this.curCity.CityCode) || "3101",
      SearchDate: myDate.toLocaleDateString(),
    };
    this.isLoadingHotHotels = true;
    await this.tmcService
      .getRecommendHotel(this.hothotels)
      .catch(() => null)
      .then((res) => {
        this.boutiqueHotel = res;
        setTimeout(() => {
          if (this.hotelsSwiper) {
            this.hotelsSwiper.update();
          }
        }, 200);
      })
      .finally(() => {
        this.isLoadingHotHotels = false;
      });
  }
  private async loadHotHotels() {
    if (
      !this.boutiqueHotel ||
      !this.boutiqueHotel.HotelDayPrices ||
      !this.boutiqueHotel.HotelDayPrices.length
    ) {
      if (!(await this.hasTicket())) {
        return;
      }
      if (!this.curCity) {
        this.mapService.getCurrentCityPosition().catch((curCity) => {
          this.curCity = curCity;
          if (this.curCity) {
            this.getRecommendHotel();
          }
        });
      }
      this.getRecommendHotel();
    }
  }

  private async myItinerary() {
    if (!this.itineraryList || !this.itineraryList.length) {
      this.itineraryList = await this.tmcService.getMyItinerary();
    }
  }

  private async integral() {
    try {
      this.integralRegion = {
        Tag: "热卖",
        PageSize: 20,
      };
      this.exchangeList = await this.tmcService.getIntegral(
        this.integralRegion
      );
    } catch (e) {
      console.error(e);
    }
  }

  onRedeemNow(item: any) {
    this.getLogin();
  }

  async onSignIn() {
    if (!this.isCanDailySigned) {
      return;
    }
    this.sign = {
      Amount: 20,
      Name: "手机",
    };
    const sub = this.tmcService
      .getSign(this.sign)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            sub.unsubscribe();
          }, 200);
        })
      )
      .subscribe((r) => {
        if (r) {
          if (r.Status) {
            this.isCanDailySigned = !r.Data;
            if (r.Message) {
              if (r.Data) {
                AppHelper.toast(r.Message, 2000, "middle");
              } else {
                AppHelper.alert(r.Message);
              }
            }
          } else {
            if (r.Message) {
              AppHelper.alert(r.Message);
            }
          }
        }
      });
  }


  private async getLogin() {
    try {
      const url = await this.tmcService.getLogin();
      console.log(url, "url");
      AppHelper.jump(this.router, url, {
        isShowFabButton: !AppHelper.isApp(),
        isHideTitle: !AppHelper.isApp(),
      });
    } catch (e) {
      console.log(e);
    }
  }

  async onTaskDetail(task) {
    const url = await this.getTaskHandleUrl(task);
    if (url) {
      this.router
        .navigate(["open-url"], {
          queryParams: {
            url,
            title: task && task.Name,
            tabId: this.activeTab?.value,
            isOpenInAppBrowser: false,
            isIframeOpen: true,
            isHideTitle: false,
            goPath: AppHelper.getNormalizedPath(this.router.url.substr(1)), // /approval-task
          },
        })
        .then((_) => {
          this.isOpenUrl = true;
        });
    }
  }

  goToDetail(id) {
    this.router.navigate([AppHelper.getRoutePath("hotel-detail")], {
      queryParams: { hotelId: id },
    });
  }

  private async getTaskHandleUrl(task) {
    const identity: IdentityEntity = await this.identityService
      .getIdentityAsync()
      .catch((_) => null);
    let url = this.getTaskUrl(task);
    if (url?.includes("?")) {
      url = `${url}&taskid=${task.Id}&ticket=${(identity && identity.Ticket) || ""
        }&isApp=true&lang=${AppHelper.getLanguage() || ""}`;
    } else {
      url = `${url}?taskid=${task.Id}&ticket=${(identity && identity.Ticket) || ""
        }&isApp=true&lang=${AppHelper.getLanguage() || ""}`;
    }
    return url;
  }

  getTaskUrl(task) {
    return task && task.HandleUrl;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateSwiper();
    }, 200);
  }
  private destroySwiper() {
    if (this.bannersSwiper) {
      this.bannersSwiper.destroy();
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
    } catch (e) { }
  }
  onSlideTouchEnd() {
    if (this.slidesEle) {
      this.slidesEle.startAutoplay();
    }
  }

  private initSwiperhotels() {
    if (this.hothotelEl && this.hothotelEl.nativeElement) {
      this.hotelsSwiper = new Swiper(this.hothotelEl.nativeElement, {
        loop: true,
        autoplay: {
          delay: 3000,
          stopOnLastSlide: false,
          disableOnInteraction: true,
        },
      });
      this.hotelsSwiper.on("touchEnd", () => {
        this.onTouchEnd();
      });
      const that = this;
      this.hotelsSwiper.on("transitionEnd", function () {
        that.onTouchEnd();
        that.hotIndex = this.activeIndex;
      });
    }
  }

  private initSwiper() {
    if (this.containerEl && this.containerEl.nativeElement) {
      this.bannersSwiper = new Swiper(this.containerEl.nativeElement, {
        loop: true,
        autoplay: {
          delay: 3000,
          stopOnLastSlide: false,
          disableOnInteraction: true,
        },
      });
      this.bannersSwiper.on("touchEnd", () => {
        this.onTouchEnd();
      });
      const that = this;
      this.bannersSwiper.on("transitionEnd", function () {
        that.onTouchEnd();
        that.curIndex = this.activeIndex;
      });
    }

    if (this.announcementEl && this.announcementEl.nativeElement) {
      this.initAnnouncementSwiper();
    }
    if (this.taskEle && this.taskEle.nativeElement) {
      this.initTaskSpwiper();
    }
    if (this.tripEle && this.tripEle.nativeElement) {
      this.initTripSpwiper();
    }
  }

  private initTaskSpwiper() {
    const mySwiper: any = {
      loop: true,
      circular: true,
      autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: true,
      },
      speed: 1000,
      direction: "vertical",
    };
    if (this.taskEle && this.taskEle.nativeElement) {
      setTimeout(() => {
        this.taskEleSwiper = new Swiper(this.taskEle.nativeElement, mySwiper);
        this.taskEleSwiper.on("touchEnd", () => {
          this.onTouchEnd();
        });
      }, 200);
    }
  }
  private initTripSpwiper() {
    const mySwiper: any = {
      loop: true,
      circular: true,
      autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: true,
      },
      speed: 1000,
      direction: "vertical",
    };
    if (this.tripEle && this.tripEle.nativeElement) {
      setTimeout(() => {
        this.tripEleSwiper = new Swiper(this.tripEle.nativeElement, mySwiper);
        this.tripEleSwiper.on("touchEnd", () => {
          this.onTouchEnd();
        });
      }, 200);
    }
  }

  private initAnnouncementSwiper() {
    const options: any = {
      loop: true,
      autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: true,
      },
      speed: 1000,
      direction: "vertical",
      isShowText: true,
    };
    if (this.announcementEl && this.announcementEl.nativeElement) {
      this.announcementElSwiper = new Swiper(
        this.announcementEl.nativeElement,
        options
      );
      this.announcementElSwiper.on("touchEnd", () => {
        this.onTouchEnd();
      });
    }
  }
  async ngOnInit() {
    this.identityService.getIdentitySource().subscribe((id) => {
      this.canSelectCompany = id && id.Numbers && !!id.Numbers.AgentId;
    });
    this.initSwiper();
    this.initSwiperhotels();
    this.tmcService.getSelectedCompanySource().subscribe((c) => {
      this.selectedCompany = c;
    });
    this.subscription = this.identityService
      .getIdentitySource()
      .subscribe(async (_) => {
        try {
          this.configService.getConfigAsync().then((c) => {
            this.config = c;
          });
          this.banners = [];
          this.itineraryList = [];
          this.tasklist = [];
          this.staffCredentials = null;
          if (!(await this.hasTicket())) {
            return;
          }
          
          this.tmcService
            .checkIfCanDailySigned()
            .then((r) => {
              if(!r.isRegister){
                this.isRegister = false;
              }
              this.isCanDailySigned = r && r.isRegister && r.isCanSign;
            })
            .catch((e) => {
              AppHelper.alert(e)
            })
          this.loadHotHotels();
          this.loadBanners();
          this.loadNotices();
          this.myItinerary();
          this.integral();
          // this.getLogin();
          // this.getSignIn();
          this.loadReviewedTask();
          this.loadMyItinerary();
        } catch (e) {
          console.error(e);
        }
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
    setTimeout(() => {
      this.startAutoPlay();
    }, 2000);
  }
  private startAutoPlay() {
    if (
      this.bannersSwiper &&
      this.bannersSwiper.autoplay &&
      this.bannersSwiper.autoplay.start
    ) {
      this.bannersSwiper.autoplay.start();
    }
    if (
      this.announcementElSwiper &&
      this.announcementElSwiper.autoplay &&
      this.announcementElSwiper.autoplay.start
    ) {
      this.announcementElSwiper.autoplay.start();
    }

    if (
      this.taskEleSwiper &&
      this.taskEleSwiper.autoplay &&
      this.taskEleSwiper.autoplay.start
    ) {
      this.taskEleSwiper.autoplay.start();
    }
    if (
      this.tripEleSwiper &&
      this.tripEleSwiper.autoplay &&
      this.tripEleSwiper.autoplay.start
    ) {
      this.tripEleSwiper.autoplay.start();
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
  async goToPage(
    entry: "flight" | "hotel" | "train" | "rentalCar",
    queryParams?: any
  ) {
    const msg = "您没有预订权限";
    let route = "";
    let ok = false;
    if (entry == "flight") {
      ok =
        (await this.tmcService.hasBookRight("flight")) ||
        (await this.tmcService.hasBookRight("international-flight"));
      if (!ok) {
        AppHelper.alert(msg);
        return;
      }
      route = "search-flight";
    }
    if (entry == "hotel") {
      ok =
        (await this.tmcService.hasBookRight("hotel")) ||
        (await this.tmcService.hasBookRight("international-hotel"));
      if (!ok) {
        AppHelper.alert(msg);
        return;
      }
      route = "search-hotel";
    }
    if (entry == "train") {
      ok = await this.tmcService.hasBookRight("train");
      if (!ok) {
        AppHelper.alert(msg);
        return;
      }
      route = "search-train";
    }
    if (entry == "rentalCar") {
      ok = await this.tmcService.hasBookRight("rentalCar");
      if (!ok) {
        AppHelper.alert(msg);
        return;
      }
      route = "rental-car";
    }
    if (route) {
      if (queryParams) {
        this.router.navigate([AppHelper.getRoutePath(route)], {
          queryParams,
        });
      } else {
        this.router.navigate([AppHelper.getRoutePath(route)]);
      }
    }
  }
  // async goToPage(name: string, params?: any) {
  //   const tmc = await this.tmcService.getTmc();
  //   const msg = "您没有预订权限";
  //   if (!tmc || !tmc.RegionTypeValue) {
  //     AppHelper.alert(msg);
  //     return;
  //   }
  //   let route = "";

  //   const tmcRegionTypeValue = tmc.RegionTypeValue.toLowerCase();
  //   if (name == "international-flight") {
  //     route = "search-international-flight";
  //     if (tmcRegionTypeValue.search("internationalflight") < 0) {
  //       AppHelper.alert(msg);
  //       return;
  //     }
  //   }
  //   if (name == "international-hotel") {
  //     route = "search-international-hotel";
  //     if (tmcRegionTypeValue.search("internationalhot") < 0) {
  //       AppHelper.alert(msg);
  //       return;
  //     }
  //   }
  //   if (name == "hotel") {
  //     route = "search-hotel";
  //     if (tmcRegionTypeValue.search("hotel") < 0) {
  //       AppHelper.alert(msg);
  //       return;
  //     }
  //   }
  //   if (name == "train") {
  //     route = "search-train";
  //     if (tmcRegionTypeValue.search("train") < 0) {
  //       AppHelper.alert(msg);
  //       return;
  //     }
  //   }
  //   if (name == "flight") {
  //     route = "search-flight";
  //     if (tmcRegionTypeValue.search("flight") < 0) {
  //       AppHelper.alert(msg);
  //       return;
  //     }
  //   }
  //   if (name == "rentalCar") {
  //     route = "rental-car";
  //     if (tmcRegionTypeValue.search("car") < 0) {
  //       AppHelper.alert(msg);
  //       return;
  //     }
  //   }
  //   if (name == "bulletin") {
  //     route = "bulletin-list";
  //   }
  //   this.router.navigate([AppHelper.getRoutePath(route)], {
  //     queryParams: { bulletinType: params },
  //   });
  // }
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
    if (this.bannersSwiper) {
      setTimeout(() => {
        this.bannersSwiper.update();
        this.startAutoPlay();
      }, 200);
    }
  }

  private async loadReviewedTask() {
    if (!this.tasklist || !this.tasklist.length) {
      if (this.isLoadingReviewedTask) {
        return;
      }
      if (!(await this.hasTicket())) {
        return;
      }
      this.isLoadingReviewedTask = true;
      this.tasklist = await this.tmcService.getTaskReviewed();
      this.isLoadingReviewedTask = false;
      try {
        if (this.tasklist) {
          for (const e of this.tasklist) {
            if (e.Name) {
              const arr = e.Name.split("(");
              if (arr.length > 1) {
                e.Name = arr[0].replace("发起", "");
                e.saName = arr[1].replace(")", "");
              }
              try {
                e.VariablesObj = JSON.parse(e.Variables);
              } catch (e) {
                console.log(e);
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
      setTimeout(() => {
        if (this.taskEleSwiper) {
          this.taskEleSwiper.update();
        }
      }, 200);
    }
  }
  private async loadMyItinerary() {
    if (!this.itineraryList || !this.itineraryList.length) {
      if (this.isLoadingMyItinerary) {
        return;
      }
      if (!(await this.hasTicket())) {
        return;
      }
      this.itineraryList = [];
      this.isLoadingMyItinerary = true;
      this.myItinerary().finally(() => {
        this.isLoadingMyItinerary = false;
        setTimeout(() => {
          if (this.tripEleSwiper) {
            this.tripEleSwiper.update();
          }
        }, 200);
      });
    }
  }

  goToDetailPage(orderId: string, type: string) {
    // Flight
    console.log(type, "dddd");

    if (type && type.toLowerCase() == "car") {
      this.router.navigate([AppHelper.getRoutePath("order-car-detail")], {
        queryParams: { Id: orderId },
      });
      return;
    }
    if (type && type.toLowerCase() == "flight") {
      this.router.navigate([AppHelper.getRoutePath("order-flight-detail")], {
        queryParams: {
          tab: JSON.stringify(this.activeTab),
          orderId: orderId,
        },
      });
      return;
    } else if (type && type.toLowerCase() == "hotel") {
      this.router.navigate([AppHelper.getRoutePath("order-hotel-detail")], {
        queryParams: {
          tab: JSON.stringify(this.activeTab),
          orderId: orderId,
        },
      });
      return;
    }
    if (type && type.toLowerCase() == "train") {
      this.router.navigate([AppHelper.getRoutePath("order-train-detail")], {
        queryParams: {
          tab: JSON.stringify(this.activeTab),
          orderId: orderId,
        },
      });
      return;
    }
    this.router.navigate([AppHelper.getRoutePath("order-detail")], {
      queryParams: {
        tab: JSON.stringify(this.activeTab),
        orderId: orderId,
      },
    });
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
        setTimeout(() => {
          if (this.announcementElSwiper) {
            this.announcementElSwiper.update();
          }
        }, 200);
      });
    }
  }
  async check() {
    if (!(await this.hasTicket())) {
      return;
    }
    let retryCount = 0;
    try {
      // this.loadNotices();
      // this.updateTaskSwiper();
      // this.updateTripSwiper();
      // this.loadBanners();
      // this.loadHotHotels();
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
    if (!this.canSelectCompany) {
      return;
    }
    this.router.navigate([AppHelper.getRoutePath("select-customer")]);
  }
  onSwitchCompany() {
    this.router.navigate([AppHelper.getRoutePath("switch-company")]);
  }
}
