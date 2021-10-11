import { OrderTrainTicketEntity } from "../../order/models/OrderTrainTicketEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { FlightHotelTrainType } from "../../tmc/tmc.service";
import { TrainService, SearchTrainModel } from "../train.service";
import { TrafficlineEntity } from "../../tmc/models/TrafficlineEntity";
import { IdentityService } from "../../services/identity/identity.service";
import { ApiService } from "src/app/services/api/api.service";
import { StaffEntity } from "src/app/hr/hr.service";
import { HrService } from "../../hr/hr.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, AfterViewInit, Directive } from "@angular/core";
import * as moment from "moment";
import { Subscription, of } from "rxjs";
import { DayModel } from "../../tmc/models/DayModel";
import { ModalController, PopoverController } from "@ionic/angular";
import { TripType } from "src/app/tmc/models/TripType";
import { CalendarService } from "src/app/tmc/calendar.service";
import { map } from "rxjs/operators";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { LangService } from "src/app/services/lang.service";
import { SelectedTrainSegmentInfoDfComponent } from "../components/selected-train-segment-info-df/selected-train-segment-info-df.component";
import { StorageService } from "src/app/services/storage-service.service";
@Directive()
export class SearchTrainBasePage
  implements OnInit, OnDestroy, AfterViewInit, CanComponentDeactivate {
  private isCanLeave = true;
  isDomestic = true;
  isSingle = true;
  goDate: DayModel;
  isShowSelectedInfos$ = of(false);
  canAddPassengers = false;
  subscriptions: Subscription[] = [];
  searchTrainModel: SearchTrainModel = new SearchTrainModel();
  isMoving: boolean;
  showReturnTrip = false;
  isSelf = false;
  selectedPassengers: number;
  selectedBookInfos: number;
  exchangeTip = "正在改签";
  staff: StaffEntity;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private staffService: HrService,
    private identityService: IdentityService,
    private trainService: TrainService,
    private calendarService: CalendarService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) {}
  async onShowSelectedBookInfos() {
    let c = SelectedTrainSegmentInfoDfComponent;
    const m = await this.modalCtrl.create({
      component: c,
    });
    m.present();
  }
  private onRoundTrip(single: boolean) {
    // console.log("onRoundTrip isSingle", single);
    this.isSingle = single;
    this.trainService.setSearchTrainModelSource({
      ...this.searchTrainModel,
      isRoundTrip: !this.isSingle,
    });
  }
  getMonth(d: DayModel) {
    return +this.calendarService.getMonth(d);
  }
  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
  }
  onToggleDomestic(isDomestic) {
    this.isDomestic = isDomestic;
  }
  onSegmentChanged(evt: CustomEvent) {
    // console.log("evt.detail.value", evt.detail.value);
    this.onRoundTrip(evt.detail.value == "single");
  }
  async isStaffTypeSelf() {
    return await this.staffService.isSelfBookType();
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
    if (!s || !s.Policy || !s.Policy.TrainDescription) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: ShowStandardDetailsComponent,
      mode: "md",
      componentProps: {
        details: s.Policy.TrainDescription.split("。"),
      },
      cssClass: "ticket-changing",
    });
    p.present();
  }
  ngOnInit() {
    this.initTrainDays();
    this.isShowSelectedInfos$ = this.trainService
      .getBookInfoSource()
      .pipe(
        map((infos) => infos && infos.filter((it) => !!it.bookInfo).length > 0)
      );
    const subscription = this.trainService
      .getSearchTrainModelSource()
      .subscribe(async (s) => {
        console.log("search-train", s);
        this.searchTrainModel = s;

        if (this.searchTrainModel) {
          if (this.searchTrainModel.IsRangeExchange) {
            const bks = this.trainService.getBookInfos();
            this.exchangeTip =
              bks[0] &&
              bks[0].exchangeInfo &&
              bks[0].exchangeInfo.rangeExchangeDateTip;
          }
          this.searchTrainModel.isExchange = s.isExchange;
          this.goDate = this.calendarService.generateDayModelByDate(s.Date);
          this.isSingle = !s.isRoundTrip;
        }
      });
    const sub = this.route.queryParamMap.subscribe(async (q) => {
      const fromCityCode = q.get("FromCityCode");
      const toCityCode = q.get("ToCityCode");
      const startDate = q.get("StartDate");
      if (fromCityCode && toCityCode && startDate) {
        const stations = await this.trainService.getStationsAsync();
        const fromCity = stations.find((it) => it.CityCode == fromCityCode);
        const toCity = stations.find((it) => it.CityCode == toCityCode);
        if (fromCity && toCity) {
          this.searchTrainModel.fromCity = fromCity;
          this.searchTrainModel.toCity = toCity;
          const Date = startDate.replace(/\./g, "-");
          this.trainService.setSearchTrainModelSource({
            ...this.searchTrainModel,
            fromCity,
            toCity,
            Date,
          });
        }
      }
      this.canAddPassengers = await this.trainService.checkIfShouldAddPassenger();
      const searchTrainModel = this.trainService.getSearchTrainModel();
      this.searchTrainModel.isExchange =
        searchTrainModel.isExchange ||
        !!this.trainService
          .getBookInfos()
          .find((it) => it.bookInfo && it.bookInfo.isExchange);
      this.staff = await this.staffService.getStaff();
      this.isSelf = await this.isStaffTypeSelf();
      // this.canAddPassengers = await this.staffService.isAllBookType() || await this.staffService.isSecretaryBookType();
      this.isCanLeave = this.searchTrainModel.isExchange ? false : true;
      this.selectedPassengers = this.trainService.getBookInfos().length;
      this.selectedBookInfos = this.trainService
        .getBookInfos()
        .filter((it) => it.bookInfo).length;
    });
    this.subscriptions.push(sub);
    this.subscriptions.push(subscription);
  }

  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger-df")], {
      queryParams: { forType: FlightHotelTrainType.Train },
    });
  }
  onSelectCity(isFrom = true) {
    if (!this.searchTrainModel) {
      return;
    }
    if (isFrom) {
      if (
        this.searchTrainModel &&
        (this.searchTrainModel.isExchange || this.searchTrainModel.isLocked)
      ) {
        return;
      }
    }
    if (!isFrom) {
      if (this.searchTrainModel.IsRangeExchange) {
        return;
      }
    }
    this.isCanLeave = true;
    this.trainService.onSelectCity(isFrom);
  }
  onSwapCity() {
    if (!this.searchTrainModel) {
      return;
    }
    if (this.searchTrainModel.isExchange || this.searchTrainModel.isLocked) {
      return;
    }
    if (
      this.searchTrainModel.isExchange &&
      this.searchTrainModel.IsRangeExchange
    ) {
      AppHelper.alert("距离出发时间48小时内，不得更改达到城市");
      return;
    }
    this.trainService.onSwapCity();
  }
  ngOnDestroy(): void {
    console.log("on destroyed");
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  async initTrainDays() {
    const infos = this.trainService.getBookInfos();
    const exchangeInfo = infos.find((it) => !!it.exchangeInfo);
    const ticket =
      exchangeInfo &&
      exchangeInfo.exchangeInfo &&
      (exchangeInfo.exchangeInfo.ticket as OrderTrainTicketEntity);
    const trip = ticket && ticket.OrderTrainTrips && ticket.OrderTrainTrips[0];
    const identity = await this.identityService.getIdentityAsync();
    let lastSelectedGoDate =
      (await this.storage.get(
        `last_selected_train_goDate_${identity && identity.Id}`
      )) || moment().format("YYYY-MM-DD");
    const nextDate = moment().add(1, "days").format("YYYY-MM-DD");
    const now = moment().format("YYYY-MM-DD");
    lastSelectedGoDate =
      lastSelectedGoDate &&
      this.calendarService.generateDayModelByDate(lastSelectedGoDate)
        .timeStamp >=
        this.calendarService.generateDayModelByDate(nextDate).timeStamp
        ? lastSelectedGoDate
        : now;
    if (trip) {
      lastSelectedGoDate =
        +moment(trip.StartTime) >= +moment()
          ? moment(trip.StartTime).format("YYYY-MM-DD")
          : now;
    }
    this.trainService.setSearchTrainModelSource({
      ...this.searchTrainModel,
      Date: lastSelectedGoDate,
    });
  }

  async searchTrain() {
    const s = this.trainService.getSearchTrainModel();
    console.log(
      `出发城市" + 【${s.fromCity.Nickname}】`,
      `目的城市【${s.toCity.Nickname}】`
    );
    console.log(`启程日期${this.goDate.date}`);
    this.trainService.cacheLastations(s.fromCity, s.toCity);
    s.tripType = this.searchTrainModel.tripType || TripType.departureTrip;
    s.Date = this.goDate.date;
    if (!s.isRoundTrip) {
      s.tripType = TripType.departureTrip;
    }
    console.log("search-train", s);
    this.isCanLeave = true;
    this.trainService.setSearchTrainModelSource(s);
    this.router
      .navigate([AppHelper.getRoutePath("train-list")])
      .then((_) => {});
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      await this.storage.set(
        `last_selected_train_goDate_${identity && identity.Id}`,
        s.Date
      );
    }
  }
  getDayDesc(d: DayModel) {
    return this.calendarService.getDescOfDay(d);
  }
  async onSelecDate(isGo: boolean) {
    if (!this.searchTrainModel) {
      return;
    }
    const bk = this.trainService.getBookInfos()[0];
    const ticket =
      bk &&
      bk.exchangeInfo &&
      (bk.exchangeInfo.ticket as OrderTrainTicketEntity);
    const trip = ticket && ticket.OrderTrainTrips && ticket.OrderTrainTrips[0];
    const endDate = this.searchTrainModel.IsRangeExchange
      ? (trip && trip.StartTime.substr(0, 10)) || ""
      : "";
    if (this.searchTrainModel.IsRangeExchange) {
      if (
        trip &&
        trip.StartTime.substr(0, 10) ==
          this.calendarService.getMoment(0).format("YYYY-MM-DD")
      ) {
        return;
      }
    }
    const days = await this.trainService.openCalendar(false, endDate);
    // console.log("train openCalendar", days);
    if (days && days.length) {
      if (this.searchTrainModel) {
        if (isGo) {
          this.searchTrainModel.Date = days[0].date;
        }
        // if (isBack) {
        //   this.searchTrainModel.BackDate = days[0].date;
        // }
        this.trainService.setSearchTrainModelSource(this.searchTrainModel);
      }
    }
  }
  onCitiesSelected(c: { vmTo: TrafficlineEntity; vmFrom: TrafficlineEntity }) {
    if (c) {
      this.trainService.setSearchTrainModelSource({
        ...this.searchTrainModel,
        fromCity: c.vmFrom,
        toCity: c.vmTo,
      });
    }
  }
  async canDeactivate() {
    if (this.isCanLeave) {
      return true;
    }
    const bookInfos = this.trainService.getBookInfos();
    const info = bookInfos.find((it) => !!it.exchangeInfo);
    const exchangeInfo = info && info.exchangeInfo;
    if (exchangeInfo) {
      const ok = await AppHelper.alert(
        "是否放弃改签？",
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      if (ok) {
        this.trainService.setSearchTrainModelSource({
          ...this.searchTrainModel,
          isExchange: false,
          IsRangeExchange: false,
          isLocked: false,
        });
        this.trainService.removeAllBookInfos();
        this.isCanLeave = true;
        return true;
      }
    }
    return false;
  }
}
