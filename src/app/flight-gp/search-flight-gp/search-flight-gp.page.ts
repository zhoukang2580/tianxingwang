import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { LanguageHelper } from "src/app/languageHelper";
import { TmcService, FlightHotelTrainType } from "src/app/tmc/tmc.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { IdentityService } from "../../services/identity/identity.service";
import { ApiService } from "src/app/services/api/api.service";
import { StaffEntity, StaffBookType } from "src/app/hr/hr.service";
import { HrService } from "../../hr/hr.service";
import { CalendarService } from "../../tmc/calendar.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from "@angular/core";
import { Subscription, of, from } from "rxjs";
import { DayModel } from "../../tmc/models/DayModel";
import {
  NavController,
  ModalController,
  PopoverController,
  Platform,
} from "@ionic/angular";
import { TripType } from "src/app/tmc/models/TripType";
import { map } from "rxjs/operators";
import { LangService } from "src/app/services/lang.service";
import { FlightGpService, SearchFlightModel } from "../flight-gp.service";
import { FlightCityService } from "src/app/flight/flight-city.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { StorageService } from "src/app/services/storage-service.service";
import { ThemeService } from "src/app/services/theme/theme.service";
@Component({
  selector: "app-search-flight-gp",
  templateUrl: "./search-flight-gp.page.html",
  styleUrls: ["./search-flight-gp.page.scss"],
})
export class SearchFlightGpPage
  implements OnInit, OnDestroy, AfterViewInit, CanComponentDeactivate
{
  isSelf = false;
  isSingle = true;
  goDate: DayModel;
  backDate: DayModel;
  searchConditionSubscription = Subscription.EMPTY;
  identitySubscription = Subscription.EMPTY;
  identity: IdentityEntity;
  searchFlightModel: SearchFlightModel;
  isMoving: boolean;
  showReturnTrip: boolean;
  disabled = false;
  totalFlyDays: number;
  staff: StaffEntity;
  isShowBookInfos$ = of(0);
  isCanleave = true;
  isleave = true;
  isAgent = false;
  seg = "single";
  domestic = "domestic";
  selectedInterPassengers: any[];
  private subscriptions: Subscription[] = [];
  get selectedPassengers() {
    return this.flightGpService.getPassengerBookInfos().length;
  }
  isEn = false;
  isIos = false;
  isSwapingCity = false;
  constructor(
    public router: Router,
    route: ActivatedRoute,
    private identityService: IdentityService,
    private calendarService: CalendarService,
    private navCtrl: NavController,
    private flightGpService: FlightGpService,
    private storage: StorageService,
    private staffService: HrService,
    private apiService: ApiService,
    private tmcService: TmcService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private langService: LangService,
    private plt: Platform,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
 
  ) {
    this.isIos = plt.is("ios");
    this.themeService.getModeSource().subscribe(m=>{
      if(m=='dark'){
        this.refEle.nativeElement.classList.add("dark")
      }else{
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
    // AppHelper.toast("sdfsdf递四方速递发是的是的发送到",20000000)
    const sub = route.queryParamMap.subscribe(async (q) => {
      this.isAgent = this.tmcService.isAgent;
      this.isEn = this.langService.isEn;
      this.isSelf = await this.staffService.isSelfBookType();
      this.isleave = false;
      this.isCanleave = false;
      this.showReturnTrip = await this.isStaffTypeSelf();
      this.initTravelCondition(q);
    });
    this.subscriptions.push(sub);
  }
  compareWithFn = (o1, o2) => {
    return o1 && o2 ? o1 === o2 : false;
  };
  onCabinChange() {
    // this.loadLoadingLevelPolicies();
  }

  async onToggleDomestic(segv: "domestic") {
    const ok = await this.tmcService.hasBookRight("flight");
    if (!ok) {
      AppHelper.alert("您没有权限");
      return;
    }
    this.domestic = segv;
  }
  private checkBackDateIsAfterflyDate() {
    if (this.goDate && this.backDate) {
      console.log(this.router.url.includes("search-flight-gp"));
      if (
        this.searchFlightModel &&
        this.searchFlightModel.isRoundTrip &&
        !this.isleave &&
        this.goDate.timeStamp > this.backDate.timeStamp
      ) {
        if (this.router.url.includes("search-flight-gp")) {
          AppHelper.alert(
            "您选择的去程日期在返程日期之后，返程日期自动更新为去程日期后一天"
          );
        }
      }
      this.backDate =
        this.goDate.timeStamp > this.backDate.timeStamp
          ? this.calendarService.generateDayModel(
              this.calendarService.getMoment(1, this.goDate.date)
            )
          : this.backDate;
    }
  }
  private async initTravelCondition(q) {
    const fromCityCode = q.get("FromCityCode");
    const toCityCode = q.get("ToCityCode");
    const startDate = q.get("StartDate");
    if (fromCityCode && toCityCode && startDate) {
      const airports = await this.flightGpService.getAllLocalAirports();
      const fromCity = airports.find((it) => it.CityCode == fromCityCode);
      const toCity = airports.find((it) => it.CityCode == toCityCode);
      if (fromCity && toCity) {
        let date = startDate.replace(/\./g, "-");
        const obj = this.searchFlightModel;
        if (
          AppHelper.getDate(date).getTime() <
          AppHelper.getDate(this.calendarService.getNowDate()).getTime()
        ) {
          date = obj.Date;
        }
        this.flightGpService.setSearchFlightModelSource({
          ...this.searchFlightModel,
          fromCity,
          toCity,
          Date: date,
        });
      }
    }
  }
  async canDeactivate() {
    if (this.flightGpService.isShowingPage) {
      this.flightGpService.onSelectCity({ isShowPage: false, isFrom: false });
      return false;
    }
    if (this.isCanleave) {
      return true;
    }
    const bookInfos = this.flightGpService
      .getPassengerBookInfos()
      .filter((it) => !!it.bookInfo);
    if (bookInfos.length) {
      return AppHelper.alert(
        "是否放弃所选航班信息？",
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
    }
    return true;
  }

  async getIdentity() {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe((r) => {
        this.identity = r;
      });
  }

  back() {
    this.isleave = true;
    this.flightGpService.removeAllBookInfos();
    // this.router.navigate([""]);
  }
  private onRoundTrip(single: boolean) {
    // console.log("onRoundTrip isSingle", single);
    this.isSingle = single;
    this.flightGpService.setSearchFlightModelSource({
      ...this.flightGpService.getSearchFlightModel(),
      isRoundTrip: !this.isSingle,
    });
    this.flightGpService.setPassengerBookInfosSource(
      this.flightGpService.getPassengerBookInfos().map((it) => {
        it.bookInfo = null;
        return it;
      })
    );
  }
  getMonth(d: DayModel) {
    return +this.calendarService.getMonth(d);
  }
  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
  }
  segmentChanged(value?: any) {
    this.seg = value;
    // console.log("evt.detail.value", evt.detail.value);
    this.onRoundTrip(value == "single");
  }
  async isStaffTypeSelf() {
    return this.staffService.isSelfBookType();
  }
  async ngOnInit() {
    this.searchConditionSubscription = this.flightGpService
      .getSearchFlightModelSource()
      .subscribe(async (s) => {
        this.searchFlightModel = s;
        if (s) {
          this.disabled = s.isLocked;
          // this.vmFromCity = s.fromCity;
          // this.vmToCity = s.toCity;
          this.isSingle = !s.isRoundTrip;
          this.goDate = this.calendarService.generateDayModelByDate(s.Date);

          this.backDate = this.calendarService.generateDayModelByDate(
            s.BackDate
          );
          this.checkBackDateIsAfterflyDate();
        }
        this.showReturnTrip = await this.staffService.isSelfBookType();
      });
    this.subscriptions.push(this.searchConditionSubscription);
    this.isShowBookInfos$ = this.flightGpService
      .getPassengerBookInfoSource()
      .pipe(map((infos) => infos.filter((it) => !!it.bookInfo).length));
    await this.initFlightCities();
    this.getIdentity();
    this.showReturnTrip = await this.staffService
      .isSelfBookType()
      .catch((_) => false);
  }
  onSelectPassenger(isDomestic = true) {
    this.isCanleave = true;
    this.isleave = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger-df")], {
      queryParams: {
        forType: isDomestic
          ? FlightHotelTrainType.Flight
          : FlightHotelTrainType.InternationalFlight,
      },
    });
  }
  // onShowSelectedInfosPage() {
  //   this.flightService.showSelectedBookInfosPage();
  // }
  ngOnDestroy(): void {
    console.log("on destroyed");
    this.searchConditionSubscription.unsubscribe();
  }

  async initFlightCities() {
    const vmFromCity: TrafficlineEntity = {
      AirportCityCode: "BJS",
      CityCode: "1101",
      CityName: "北京",
      Code: "BJS",
      CountryCode: "CN",
      Description: "",
      EnglishName: "Beijing",
      Id: "9278",
      Initial: "bj",
      IsHot: true,
      Name: "北京",
      Nickname: "北京",
      Pinyin: "Beijing",
      Sequence: 2,
      Tag: "AirportCity",
    } as TrafficlineEntity;
    const vmToCity = {
      AirportCityCode: "SHA",
      CityCode: "3101",
      CityName: "上海",
      Code: "SHA",
      CountryCode: "CN",
      Description: "",
      EnglishName: "Shanghai",
      Id: "9260",
      Initial: "",
      IsHot: true,
      Name: "上海",
      Nickname: "上海",
      Pinyin: "Shanghai",
      Sequence: 1,
      // 出发城市，不是出发城市的那个机场
      Tag: "AirportCity",
    } as TrafficlineEntity;
    const lastFromCity =
      (await this.storage
        .get("fromCity_gp")
        .then((c: TrafficlineEntity) => {
          if (!c.Code) {
            return null;
          }
          return c;
        })
        .catch((_) => null)) || vmFromCity;
    const lastToCity =
      (await this.storage
        .get("toCity_gp")
        .then((c: TrafficlineEntity) => {
          if (!c.Code) {
            return null;
          }
          return c;
        })
        .catch((_) => null)) || vmToCity;
    this.flightGpService.setSearchFlightModelSource({
      ...this.flightGpService.getSearchFlightModel(),
      fromCity: lastFromCity,
      toCity: lastToCity,
    });
  }
  async searchFlight() {
    let ok = await this.tmcService.hasBookRight("flightGp");

    if (!ok) {
      AppHelper.alert("您没有预订权限");
      return;
    }
    this.isCanleave = true;
    this.isleave = true;
    console.log(`启程日期${this.goDate.date},返程日期：${this.backDate.date}`);
    this.storage.set("fromCity_gp", this.searchFlightModel.fromCity);
    this.storage.set("toCity_gp", this.searchFlightModel.toCity);

    const s: SearchFlightModel =
      this.searchFlightModel || new SearchFlightModel();
    // s.tripType = TripType.departureTrip;
    const staff = await this.staffService.getStaff().catch((_) => null);
    if (staff && staff.BookType == StaffBookType.Self) {
      const exists = this.flightGpService.getPassengerBookInfos();
      console.log(exists, "exists==============");
      const go = exists.find(
        (it) => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
      );
      const back = exists.find(
        (it) => it.bookInfo && it.bookInfo.tripType == TripType.returnTrip
      );
      // if (go && back && !exists.some(it => it.isReplace)) {
      //   s.tripType = TripType.departureTrip;
      // }
      if (go) {
        const arrivalDate = this.calendarService.getMoment(
          0,
          go.bookInfo &&
            go.bookInfo.flightSegment &&
            go.bookInfo.flightSegment.ArrivalTime
        );
        if (
          +this.calendarService.getMoment(0, this.backDate.date) <
          +this.calendarService.getMoment(0, arrivalDate.format("YYYY-MM-DD"))
        ) {
          AppHelper.alert("返程时间不能在去程时间之前");
          return;
          // this.backDate = this.calendarService.generateDayModel(arrivalDate);
        }
      } else {
        s.tripType = TripType.departureTrip;
      }
    } else {
      s.tripType = TripType.departureTrip;
    }
    s.Date = this.goDate.date;
    s.ToAsAirport = this.searchFlightModel.toCity.Tag === "Airport"; // Airport 以到达 机场 查询;AirportCity 以城市查询
    s.FromAsAirport = this.searchFlightModel.fromCity.Tag === "Airport"; // Airport 以出发 机场 查询
    s.isRoundTrip = !this.isSingle;
    s.BackDate = this.backDate.date;
    if (this.disabled) {
      s.Date = s.BackDate;
    }
    // s.tripType = s.isRoundTrip ? goFlight ? s.tripType : TripType.departureTrip : TripType.departureTrip;
    console.log("search-flight", s);
    // this.calendarService.setSelectedDaysSource([this.calendarService.generateDayModelByDate(s.Date)]);
    this.flightGpService.setSearchFlightModelSource(s);
    this.router.navigate([AppHelper.getRoutePath("flight-gp-list")]);
    this.cachLastSelectedFlightGoDate(s.Date);
  }
  private async cachLastSelectedFlightGoDate(date: string) {
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      await this.storage.set(
        `last_selected_flight_gp_goDate_${identity.Id}`,
        date
      );
    }
  }
  getDayDesc(d: DayModel) {
    return this.calendarService.getDescOfDay(d);
  }
  onSwapCity() {
    if (this.disabled || this.isSwapingCity) {
      return;
    }
    this.isSwapingCity = true;
    this.flightGpService.onSwapCity();
    setTimeout(() => {
      this.isSwapingCity = false;
    }, 240);
  }
  async onSelectCity(isFromCity = true) {
    this.isCanleave = true;
    const rs = await this.flightGpService.onSelectCity({
      isDomestic: true,
      isFrom: isFromCity,
      isShowPage: true,
    });
    if (rs) {
      const s = this.searchFlightModel;
      if (rs.isDomestic) {
        const fromCity = isFromCity ? rs.city : s.fromCity;
        const toCity = isFromCity ? s.toCity : rs.city;
        this.flightGpService.setSearchFlightModelSource({
          ...s,
          fromCity,
          toCity,
          FromCode: fromCity.Code,
          ToCode: toCity.Code,
          FromAsAirport: s.ToAsAirport,
          ToAsAirport: s.FromAsAirport,
        });
      } else {
      }
    }
  }
  async onSelecFlyDate(flyTo: boolean, backDate: boolean) {
    if (this.disabled) {
      return;
    }
    const dates = await this.flightGpService.openCalendar(
      false,
      flyTo ? TripType.departureTrip : backDate ? TripType.returnTrip : null
    );
    if (dates && dates.length) {
      if (dates.length && this.searchFlightModel) {
        if (flyTo) {
          this.searchFlightModel.Date = dates[0].date;
        } else if (this.goDate) {
          this.searchFlightModel.Date = this.goDate.date;
        }
        if (backDate) {
          this.searchFlightModel.BackDate = dates[0].date;
        } else if (this.backDate) {
          this.searchFlightModel.BackDate = this.backDate.date;
        }
      }
    }
    this.cachLastSelectedFlightGoDate(this.searchFlightModel.Date);
    this.flightGpService.setSearchFlightModelSource(this.searchFlightModel);
  }
}
