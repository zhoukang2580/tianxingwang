import { ShowStandardDetailsComponent } from "../../tmc/components/show-standard-details/show-standard-details.component";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { LanguageHelper } from "src/app/languageHelper";
import { TmcService, FlightHotelTrainType } from "src/app/tmc/tmc.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { IdentityService } from "../../services/identity/identity.service";
import { ApiService } from "src/app/services/api/api.service";
import { StaffEntity, StaffBookType } from "src/app/hr/hr.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { HrService } from "../../hr/hr.service";
import {
  FlightService,
  SearchFlightModel,
} from "src/app/flight/flight.service";
import { CalendarService } from "../../tmc/calendar.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
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
import {
  FlightVoyageType,
  IInternationalFlightSearchModel,
  InternationalFlightService,
  ITripInfo,
} from "src/app/international-flight/international-flight.service";
import { FlightCityService } from "../flight-city.service";
import { CONFIG } from "src/app/config";
import { flatten } from "@angular/compiler";
import { StorageService } from "src/app/services/storage-service.service";
@Component({
  selector: "app-search-flight-df",
  templateUrl: "./search-flight-df.page.html",
  styleUrls: ["./search-flight-df.page.scss"],
})
export class SearchFlightDfPage
  implements OnInit, OnDestroy, AfterViewInit, CanComponentDeactivate
{
  isSelf = false;
  isSingle = true;
  goDate: DayModel;
  backDate: DayModel;
  searchConditionSubscription = Subscription.EMPTY;
  searchFlightModel: SearchFlightModel;
  searchInterFlightModel: IInternationalFlightSearchModel;
  isMoving: boolean;
  showReturnTrip: boolean;
  disabled = false;
  totalFlyDays: number;
  staff: StaffEntity;
  isShowBookInfos$ = of(0);
  isCanleave = true;
  isleave = true;
  seg = "single";
  domestic: "domestic" | "international" = "domestic";
  selectedInterPassengers: any[];
  FlightVoyageType = FlightVoyageType;
  private subscriptions: Subscription[] = [];
  get selectedPassengers() {
    return this.flightService.getPassengerBookInfos().length;
  }

  get selectedPassengersIn(){
    return this.internationalFlightService.getBookInfos().length;
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
    private flightService: FlightService,
    private internationalFlightService: InternationalFlightService,
    private storage: StorageService,
    private staffService: HrService,
    private apiService: ApiService,
    private tmcService: TmcService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private langService: LangService,
    private plt: Platform,
    
  ) {
    this.isIos = plt.is("ios");
    const sub = route.queryParamMap.subscribe(async (q) => {
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
  async onSelectInterCity(isFrom: boolean, trip: ITripInfo) {
    if (this.disabled) {
      return;
    }
    trip.isSelectInfo = true;
    const rs = await this.flightService.onSelectCity({
      isShowPage: true,
      isFrom,
      isDomestic: false
    });
    if (rs && rs.city) {
      this.internationalFlightService.onCitySelected(rs.city, isFrom);
    }
  }
  async onSelectInterFlyDate(isFrom: boolean, trip: ITripInfo) {
    if (this.disabled) {
      return;
    }
    this.internationalFlightService.onSelectFlyDate(isFrom, trip);
  }
  onSwapInterCity(trip: {
    fromCity: TrafficlineEntity;
    toCity: TrafficlineEntity;
  }) {
    if (!trip || !trip.fromCity || !trip.toCity) {
      return;
    }
    const t = trip.fromCity;
    trip.fromCity = trip.toCity;
    trip.toCity = t;
    if (this.searchFlightModel) {
      this.internationalFlightService.setSearchModelSource(
        this.searchInterFlightModel
      );
    }
  }
  onAddMoreTrip() {
    this.internationalFlightService.addMoreTrip();
  }
  onRemoveTrip(trip: ITripInfo) {
    if (this.searchInterFlightModel && trip) {
      this.searchInterFlightModel.trips =
        this.searchInterFlightModel.trips.filter((it) => it.id != trip.id);
      this.internationalFlightService.setSearchModelSource(
        this.searchInterFlightModel
      );
    }
  }
  onTripsSegmentChanged(evt: CustomEvent) {
    const voyageType: FlightVoyageType = evt.detail.value;
    if (voyageType == FlightVoyageType.OneWay) {
      this.internationalFlightService.initOneWaySearModel();
    }
    if (voyageType == FlightVoyageType.GoBack) {
      this.internationalFlightService.initGoBackSearchModel();
    }
    if (voyageType == FlightVoyageType.MultiCity) {
      this.internationalFlightService.initMultiTripSearchModel();
    }
  }

  async onToggleDomestic(segv: "international" | "domestic") {
    if (segv == "international") {
      const ok = await this.tmcService.hasBookRight("international-flight");
      if (!ok) {
        AppHelper.alert("您没有权限");
        return;
      }
    } else {
      const ok = await this.tmcService.hasBookRight("flight");
      if (!ok) {
        AppHelper.alert("您没有权限");
        return;
      }
    }
    this.domestic = segv;
  }
  private checkBackDateIsAfterflyDate() {
    if (this.goDate && this.backDate) {
      console.log(this.router.url.includes("search-flight"));
      if (
        this.searchFlightModel &&
        this.searchFlightModel.isRoundTrip &&
        !this.isleave &&
        this.goDate.timeStamp > this.backDate.timeStamp
      ) {
        if (this.router.url.includes("search-flight")) {
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
      const airports = await this.flightService.getAllLocalAirports();
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
        this.flightService.setSearchFlightModelSource({
          ...this.searchFlightModel,
          fromCity,
          toCity,
          Date: date,
        });
      }
    }
  }
  async canDeactivate() {
    if (this.flightService.isShowingPage) {
      this.flightService.onSelectCity({ isShowPage: false, isFrom: false });
      return false;
    }
    if (this.isCanleave) {
      return true;
    }
    const bookInfos = this.flightService
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
  async onShowStandardDesc() {
    this.isSelf = await this.staffService.isSelfBookType();
    if (!this.isSelf) {
      return;
    }
    let s = await this.staffService.getStaff();
    if (!s) {
      s = await this.staffService.getStaff(true);
    }
    if (!s || !s.Policy || !s.Policy.FlightDescription) {
      return;
    }
    const desc =
      this.domestic == "domestic"
        ? s.Policy.FlightDescription
        : s.Policy.InternationalFlightDescription;
    const p = await this.popoverCtrl.create({
      component: ShowStandardDetailsComponent,
      mode: "md",
      componentProps: {
        details: desc.split(","),
      },
      cssClass: "ticket-changing",
    });
    p.present();
  }
  back() {
    this.isleave = true;
    this.flightService.removeAllBookInfos();
    this.router.navigate([""]);
  }
  private onRoundTrip(single: boolean) {
    // console.log("onRoundTrip isSingle", single);
    this.isSingle = single;
    this.flightService.setSearchFlightModelSource({
      ...this.flightService.getSearchFlightModel(),
      isRoundTrip: !this.isSingle,
    });
    this.flightService.setPassengerBookInfosSource(
      this.flightService.getPassengerBookInfos().map((it) => {
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
    this.tmcService.hasBookRight("flight").then((ok) => {
      if (!ok) {
        this.domestic = "international";
      }
    });
    this.subscriptions.push(
      this.internationalFlightService.getBookInfoSource().subscribe((infos) => {
        this.selectedInterPassengers = infos;
      })
    );
    this.subscriptions.push(
      this.internationalFlightService.getSearchModelSource().subscribe((m) => {
        this.searchInterFlightModel = m;
      })
    );
    this.searchConditionSubscription = this.flightService
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
    // this.isShowBookInfos$ = this.flightService
    //   .getPassengerBookInfoSource()
    //   .pipe(map((infos) => infos.filter((it) => !!it.bookInfo).length));
    // this.isShowBookInfos$ = this.internationalFlightService
    //   .getBookInfoSource()
    //   .pipe(map((infos) => infos.filter((it) => !!it.bookInfo).length));
    await this.initFlightCities();
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
  private searchInterFlight() {
    const m = this.searchInterFlightModel;
    if (m) {
      if (
        m.voyageType == FlightVoyageType.GoBack ||
        m.voyageType == FlightVoyageType.OneWay
      ) {
        if (m.trips[0] && m.trips[0].fromCity && m.trips[0].toCity) {
          if (
            (m.trips[0].fromCity.CountryCode || "").toLowerCase() == "cn" &&
            (m.trips[0].toCity.CountryCode || "").toLowerCase() == "cn"
          ) {
            AppHelper.toast("出发地和目的地不可全为大陆地区", 1500, "middle");
            return;
          }
        }
      }
    }
    this.router.navigate([AppHelper.getRoutePath("international-flight-list")]);
    this.internationalFlightService.flightListResult = null;
  }
  onShowSelectedInfosPage() {
    this.flightService.showSelectedBookInfosPage();
  }
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
        .get("fromCity")
        .then((c: TrafficlineEntity) => {
          if (!c.Code) {
            return null;
          }
          return c;
        })
        .catch((_) => null)) || vmFromCity;
    const lastToCity =
      (await this.storage
        .get("toCity")
        .then((c: TrafficlineEntity) => {
          if (!c.Code) {
            return null;
          }
          return c;
        })
        .catch((_) => null)) || vmToCity;
    this.flightService.setSearchFlightModelSource({
      ...this.flightService.getSearchFlightModel(),
      fromCity: lastFromCity,
      toCity: lastToCity,
    });
  }
  async searchFlight(isDomestic = true) {
    let ok = await this.tmcService.hasBookRight("flight");
    if (!isDomestic) {
      ok = await this.tmcService.hasBookRight("international-flight");
      if (!ok) {
        AppHelper.alert("您没有预订权限");
        return;
      }
      this.searchInterFlight();
      return;
    }
    if (!ok) {
      AppHelper.alert("您没有预订权限");
      return;
    }
    this.isCanleave = true;
    this.isleave = true;
    console.log(`启程日期${this.goDate.date},返程日期：${this.backDate.date}`);
    this.storage.set("fromCity", this.searchFlightModel.fromCity);
    this.storage.set("toCity", this.searchFlightModel.toCity);

    const s: SearchFlightModel =
      this.searchFlightModel || new SearchFlightModel();
    // s.tripType = TripType.departureTrip;
    const staff = await this.staffService.getStaff().catch((_) => null);
    if (staff && staff.BookType == StaffBookType.Self) {
      const exists = this.flightService.getPassengerBookInfos();
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
    s.ToAsAirport =
      this.searchFlightModel.toCity &&
      this.searchFlightModel.toCity.Tag === "Airport"; // Airport 以到达 机场 查询;AirportCity 以城市查询
    s.FromAsAirport =
      this.searchFlightModel.fromCity &&
      this.searchFlightModel.fromCity.Tag === "Airport"; // Airport 以出发 机场 查询
    s.isRoundTrip = !this.isSingle;
    s.BackDate = this.backDate.date;
    if (this.disabled) {
      s.Date = s.BackDate;
    }
    // s.tripType = s.isRoundTrip ? goFlight ? s.tripType : TripType.departureTrip : TripType.departureTrip;
    console.log("search-flight", s);
    // this.calendarService.setSelectedDaysSource([this.calendarService.generateDayModelByDate(s.Date)]);
    this.flightService.setSearchFlightModelSource(s);
    // this.router.navigate([AppHelper.getRoutePath(`flight-list${(this.searchFlightModel.isRoundTrip)?"-roundtrip":""}`)]);
    this.router.navigate([`flight-list`]);
    this.cachLastSelectedFlightGoDate(s.Date);
  }
  private async cachLastSelectedFlightGoDate(date: string) {
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      await this.storage.set(
        `last_selected_flight_goDate_${identity.Id}`,
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
    this.flightService.onSwapCity();
    setTimeout(() => {
      this.isSwapingCity = false;
    }, 240);
  }
  async onSelectCity(isFromCity = true) {
    this.isCanleave = true;
    const rs = await this.flightService.onSelectCity({
      isDomestic: true,
      isFrom: isFromCity,
      isShowAirports: false,
      isShowPage: true,
      isShow3Code: true,
      isShowCityName: false,
      isShowSegs:false
    });
    if (rs) {
      const s = this.searchFlightModel;
      if (rs.isDomestic) {
        const fromCity = isFromCity ? rs.city : s.fromCity;
        const toCity = isFromCity ? s.toCity : rs.city;
        this.flightService.setSearchFlightModelSource({
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
    const dates = await this.flightService.openCalendar(
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
    this.flightService.setSearchFlightModelSource(this.searchFlightModel);
  }
}
