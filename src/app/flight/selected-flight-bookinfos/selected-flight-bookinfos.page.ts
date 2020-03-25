import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";

import { Subscription, Observable } from "rxjs";

import { PassengerBookInfo } from "src/app/tmc/tmc.service";

import { IFlightSegmentInfo } from "../models/PassengerFlightInfo";

import { SearchFlightModel, FlightService } from "../flight.service";

import { IdentityEntity } from "src/app/services/identity/identity.entity";

import { TripType } from "src/app/tmc/models/TripType";

import { ModalController, NavController } from "@ionic/angular";

import { CalendarService } from "src/app/tmc/calendar.service";

import { StaffService } from "src/app/hr/staff.service";

import { Router } from "@angular/router";

import { IdentityService } from "src/app/services/identity/identity.service";

import { tap } from "rxjs/operators";

import { AppHelper } from "src/app/appHelper";

import { LanguageHelper } from "src/app/languageHelper";

import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";

import { SelectFlightsegmentCabinComponent } from "../components/select-flightsegment-cabin/select-flightsegment-cabin.component";
import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";
import { OrderService } from "src/app/order/order.service";
import { ProductItemType } from "src/app/tmc/models/ProductItems";

@Component({
  selector: "app-selected-flight-bookinfos",
  templateUrl: "./selected-flight-bookinfos.page.html",
  styleUrls: ["./selected-flight-bookinfos.page.scss"]
})
export class SelectedFlightBookInfosPage implements OnInit, OnDestroy {
  private subscritions: Subscription[] = [];
  bookInfos: PassengerBookInfo<IFlightSegmentInfo>[];
  passengerAndBookInfos$: Observable<PassengerBookInfo<IFlightSegmentInfo>[]>;
  searchModel: SearchFlightModel;
  identity: IdentityEntity;
  showSelectReturnTripButton = false;
  TripType = TripType;
  isSelf: boolean;
  constructor(
    private modalCtrl: ModalController,
    private flightService: FlightService,
    private flydayService: CalendarService,
    private staffService: StaffService,
    private router: Router,
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private identityService: IdentityService,
    private navCtrl: NavController,
    private orderService: OrderService
  ) {}
  ngOnDestroy() {
    this.subscritions.forEach(sub => sub.unsubscribe());
  }
  async ngOnInit() {
    this.subscritions.push(
      this.route.queryParamMap.subscribe(async () => {
        this.isSelf = await this.staffService.isSelfBookType();
      })
    );
    this.subscritions.push(
      this.flightService.getSearchFlightModelSource().subscribe(m => {
        this.searchModel = m;
      })
    );
    this.passengerAndBookInfos$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(
        tap(async infos => {
          this.bookInfos = infos.filter(it => !!it.bookInfo);
          this.isSelf = await this.staffService.isSelfBookType();
          if (this.isSelf) {
            const goinfo = infos.find(
              item =>
                item.bookInfo &&
                item.bookInfo.tripType == TripType.departureTrip
            );
            const backInfo = infos.find(
              item =>
                item.bookInfo && item.bookInfo.tripType == TripType.returnTrip
            );
            this.showSelectReturnTripButton =
              this.flightService.getSearchFlightModel().isRoundTrip &&
              goinfo &&
              !backInfo;
          } else {
            this.showSelectReturnTripButton = false;
          }
          // console.log("showSelectReturnTripButton",this.showSelectReturnTripButton);
        })
      );
    this.subscritions.push(
      this.identityService.getIdentitySource().subscribe(identity => {
        this.identity = identity;
      })
    );
  }
  onExchange() {
    this.processExchange();
  }
  getTime(takofftime: string) {
    return this.calendarService.getHHmm(takofftime);
  }
  private async processExchange() {
    const infos = this.flightService.getPassengerBookInfos();
    const info: PassengerBookInfo<IFlightSegmentInfo> = infos && infos[0];
    if (!info || !info.exchangeInfo || !info.exchangeInfo.trip) {
      AppHelper.alert("改签失败，请重试");
      return false;
    }
    const trip: OrderFlightTripEntity = info.exchangeInfo
      .trip as OrderFlightTripEntity;
    const tips = [];
    if (trip.Carrier != info.bookInfo.flightSegment.Carrier) {
      tips.push(
        `所选航班承运人与旅客所持机票承运人不同，无法直接更改。需将所持机票退票（或将产生退票费），重新购买机票。`
      );
    } else if (trip.TicketPrice > info.bookInfo.flightPolicy.Cabin.SalesPrice) {
      tips.push(
        `所选航班票价低于旅客所持机票票价，无法直接更改。需将所持机票退票（或将产生退票费），重新购买机票。`
      );
    }
    let tip = "是否确认更改？";
    if (tips.length) {
      const msg = tips.join(",");
      tip = msg + (msg.includes("。") ? "" : " 。") + tip;
    }
    const ok = await AppHelper.alert(
      tip,
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    let result = false;
    if (ok) {
      result = await this.orderService
        .exchangeInfoFlightTrip(this.flightService.getPassengerBookInfos()[0])
        .then(() => true)
        .catch(e => {
          AppHelper.alert(e);
          return false;
        });
      this.flightService.setSearchFlightModelSource({
        ...this.flightService.getSearchFlightModel(),
        isExchange: false,
        isLocked: false
      });
      this.flightService.setPassengerBookInfosSource(
        this.flightService.getPassengerBookInfos().map(it => {
          it.exchangeInfo = null;
          it.bookInfo = null;
          return it;
        })
      );
      if (result) {
        AppHelper.toast("改签申请中", 2000, "middle");
      }
    }
    this.navCtrl.navigateRoot(
      `product-tabs?tabId=${ProductItemType.plane}&doRefresh=${result}`,
      {
        animated: true
      }
    );
  }
  async nextStep() {
    const bookInfos = this.flightService
      .getPassengerBookInfos()
      .filter(it => !!it.bookInfo);
    const isSelf = await this.staffService.isSelfBookType();
    const s = this.flightService.getSearchFlightModel();
    if (isSelf && s.isRoundTrip && bookInfos.length == 1) {
      const back = bookInfos.find(
        it => it.bookInfo.tripType == TripType.returnTrip
      );
      if (!back) {
        const ok = await AppHelper.alert(
          "您尚未选择回程",
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        if (!ok) {
          return;
        }
      }
    }
    this.flightService.dismissAllTopOverlays();
    this.router.navigate([AppHelper.getRoutePath("flight-book")]);
  }
  async reelect(info: PassengerBookInfo<IFlightSegmentInfo>) {
    await this.flightService.reselectPassengerFlightSegments(info);
  }
  canShowLowerSegment(info: PassengerBookInfo<IFlightSegmentInfo>) {
    const pfs = info.bookInfo;
    let show = !!(
      pfs &&
      pfs.lowerSegmentInfo &&
      pfs.lowerSegmentInfo.lowestFlightSegment &&
      pfs.lowerSegmentInfo.lowestCabin
    );
    if (
      this.isSelf &&
      info.bookInfo &&
      info.bookInfo.tripType == TripType.returnTrip
    ) {
      const bookInfos = this.flightService.getPassengerBookInfos();
      const goInfo = bookInfos.find(
        it => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
      );
      const goFlight =
        goInfo && goInfo.bookInfo && goInfo.bookInfo.flightSegment;
      if (
        goFlight &&
        show &&
        // 来回的机场要对应才计算
        goFlight.FromAirport == info.bookInfo.flightSegment.ToAirport &&
        goFlight.ToAirport == info.bookInfo.flightSegment.FromAirport
      ) {
        const arrivalTime = this.calendarService
          .getMoment(0, goFlight.ArrivalTime)
          .add(1, "hours");
        const loweerTime = this.calendarService.getMoment(
          0,
          pfs.lowerSegmentInfo.lowestFlightSegment.TakeoffTime
        );
        show = +loweerTime >= +arrivalTime;
      }
    }
    return show;
  }
  private checkAirportChange(
    info: PassengerBookInfo<IFlightSegmentInfo>,
    lowestFlightSegment: FlightSegmentEntity
  ) {
    if (
      info &&
      info.bookInfo &&
      info.bookInfo.flightSegment &&
      lowestFlightSegment
    ) {
      if (
        info.bookInfo.flightSegment.ToAirport != lowestFlightSegment.ToAirport
      ) {
        return true;
      }
      if (
        info.bookInfo.tripType == TripType.returnTrip &&
        info.bookInfo.flightSegment.FromAirport !=
          lowestFlightSegment.FromAirport
      ) {
        return true;
      }
    }
    return false;
  }
  async onSelectLowestSegment(info: PassengerBookInfo<IFlightSegmentInfo>) {
    const { lowestCabin, lowestFlightSegment } =
      info.bookInfo && info.bookInfo.lowerSegmentInfo;
    if (!lowestCabin || !lowestFlightSegment) {
      await AppHelper.alert(
        LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
      );
      return "";
    }
    let tip = [];
    if (info && info.bookInfo && info.bookInfo.flightSegment) {
      if (
        info.bookInfo.flightSegment.ToAirport != lowestFlightSegment.ToAirport
      ) {
        tip.push(
          `抵达机场将由【${info.bookInfo.flightSegment.ToAirportName}】 变更为 【${lowestFlightSegment.ToAirportName}】`
        );
      }
      if (
        info.bookInfo.flightSegment.FromAirport !=
        lowestFlightSegment.FromAirport
      ) {
        tip.push(
          `出发机场将由【${info.bookInfo.flightSegment.FromAirportName}】 变更为 【${lowestFlightSegment.FromAirportName}】`
        );
      }
    }
    if (tip.length) {
      const ok = await AppHelper.alert(
        `${tip.join(";")}，是否继续？`,
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      if (!ok) {
        return;
      }
    }
    const m = await this.modalCtrl.create({
      component: SelectFlightsegmentCabinComponent,
      componentProps: {
        policiedCabins: [lowestCabin],
        flightSegment: lowestFlightSegment,
        isAgent:
          this.identity &&
          this.identity.Numbers &&
          this.identity.Numbers["AgentId"]
      }
    });
    m.backdropDismiss = false;
    await this.flightService.dismissTopOverlay();
    await m.present();
    const result = await m.onDidDismiss();
    const data = info.bookInfo;
    if (result.data) {
      const cbin = result.data;
      if (!cbin) {
        await AppHelper.alert(
          LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
        );
      } else {
        const bookInfo: IFlightSegmentInfo = {
          flightPolicy: cbin,
          flightSegment: lowestFlightSegment,
          tripType: data.tripType,
          id: AppHelper.uuid(),
          lowerSegmentInfo: null,
          originalBookInfo: {
            ...info,
            bookInfo: {
              ...info.bookInfo,
              lowerSegmentInfo: null
            }
          }
        };
        bookInfo.flightPolicy.LowerSegment = null; // 更低价仅能选择一次.
        const newInfo: PassengerBookInfo<IFlightSegmentInfo> = {
          id: AppHelper.uuid(),
          passenger: info.passenger,
          credential: info.credential,
          isNotWhitelist: info.isNotWhitelist,
          bookInfo
        };
        this.flightService.replacePassengerBookInfo(info, newInfo);
      }
    }
  }

  async remove(item: PassengerBookInfo<IFlightSegmentInfo>, message?: string) {
    const ok = await AppHelper.alert(
      message || LanguageHelper.Flight.getConfirmRemoveFlightSegmentTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (ok) {
      await this.flightService.removePassengerBookInfo(item, false);
    }
  }
  getDate(s: FlightSegmentEntity) {
    if (!s) {
      return "";
    }
    const day = this.flydayService.generateDayModel(
      this.calendarService.getMoment(0, s.TakeoffTime)
    );
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getFlightIllegalTip(info: PassengerBookInfo<IFlightSegmentInfo>) {
    return (
      info &&
      info.passenger &&
      info.passenger.Policy &&
      info.passenger.Policy.FlightIllegalTip
    );
  }
  getFlightlegalTip(info: PassengerBookInfo<IFlightSegmentInfo>) {
    return (
      info &&
      info.passenger &&
      info.passenger.Policy &&
      info.passenger.Policy.FlightLegalTip
    );
  }
  getTripTypeTip(info: IFlightSegmentInfo) {
    if (!info || !this.isSelf) {
      return "";
    }
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
    }]`;
  }

  async onSelectReturnTrip() {
    await this.flightService.onSelectReturnTrip();
  }
}
