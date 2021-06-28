import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";

import { Subscription, Observable } from "rxjs";

import { PassengerBookInfo, PassengerBookInfoGp } from "src/app/tmc/tmc.service";

import {
  FlightPolicy,
  IFlightSegmentInfo,
} from "../models/PassengerFlightInfo";

import { IdentityEntity } from "src/app/services/identity/identity.entity";

import { TripType } from "src/app/tmc/models/TripType";

import { ModalController, NavController } from "@ionic/angular";

import { CalendarService } from "src/app/tmc/calendar.service";

import { Router } from "@angular/router";

import { IdentityService } from "src/app/services/identity/identity.service";

import { tap } from "rxjs/operators";

import { AppHelper } from "src/app/appHelper";

import { LanguageHelper } from "src/app/languageHelper";

import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";

import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";
import { OrderService } from "src/app/order/order.service";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { FlightCabinFareType } from "../models/flight/FlightCabinFareType";
import { FlightGpService, SearchFlightModel } from "../flight-gp.service";
import { SelectFlightsegmentCabinComponent } from "src/app/flight/components/select-flightsegment-cabin/select-flightsegment-cabin.component";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";

@Component({
  selector: "app-selected-confirm-bookinfos-gp",
  templateUrl: "./selected-confirm-bookinfos-gp.page.html",
  styleUrls: ["./selected-confirm-bookinfos-gp.page.scss"],
})
export class SelectedConfirmBookInfosGpPage implements OnInit, OnDestroy {
  private subscritions: Subscription[] = [];
  // bookInfos: PassengerBookInfo<IFlightSegmentInfo>[];
  bookInfos: PassengerBookInfoGp[];
  // passengerAndBookInfos$: Observable<PassengerBookInfo<IFlightSegmentInfo>[]>;
  // private passengerBookInfoSource: Subject<
  //   PassengerBookInfo<IFlightSegmentInfo>[]
  // >;
  // private passengerBookInfoGpSource: Subject<
  //   PassengerBookInfoGp[]
  // >;
  private pageUrl;
  passengerAndBookInfos$: Observable<PassengerBookInfoGp[]>;
  searchModel: SearchFlightModel;
  identity: IdentityEntity;
  showSelectReturnTripButton = false;
  FlightCabinFareType = FlightCabinFareType;
  TripType = TripType;
  isSelf: boolean;
  @ViewChild(BackButtonComponent, { static: true }) backbtn: BackButtonComponent;
  constructor(
    private modalCtrl: ModalController,
    private flightGpService: FlightGpService,
    private flydayService: CalendarService,
    private router: Router,
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private identityService: IdentityService,
    private navCtrl: NavController,
    private orderService: OrderService,
    activatedRoute: ActivatedRoute,
  ) { 
    activatedRoute.queryParamMap.subscribe(async (p) => {
      this.pageUrl=this.router.url;
    })
  }
  ngOnDestroy() {
    this.subscritions.forEach((sub) => sub.unsubscribe());
  }
  async ngOnInit() {
    // this.subscritions.push(
    //   this.route.queryParamMap.subscribe(async () => {
    //     this.isSelf = await this.staffService.isSelfBookType();
    //   })
    // );
    
    this.subscritions.push(
      this.flightGpService.getSearchFlightModelSource().subscribe((m) => {
        this.searchModel = m;
      })
    );
    this.passengerAndBookInfos$ = this.flightGpService
      .getPassengerBookInfoGpSource()
      .pipe(
        tap(async (infos) => {
          this.bookInfos = infos;
          
          console.log(infos, 'infos');
          // const m = this.flightService.getSearchFlightModel();
          // this.showSelectReturnTripButton =
          //   !m.isExchange && m.isRoundTrip;
          // } else {
          //   this.showSelectReturnTripButton = false;
          // }
          // console.log("showSelectReturnTripButton",this.showSelectReturnTripButton);
        })
      );
    
    this.passengerAndBookInfos$.forEach((it)=>{
      console.log(it,'it');
    })
    this.subscritions.push(
      this.identityService.getIdentitySource().subscribe((identity) => {
        this.identity = identity;
      })
    );
  }
  async onExchange() {
    const result = await this.processExchange().catch(() => false);
    this.flightGpService.setSearchFlightModelSource({
      ...this.flightGpService.getSearchFlightModel(),
      isExchange: false,
      isLocked: false,
    });
    this.flightGpService.setPassengerBookInfoGpSource(
      this.flightGpService.getPassengerBookInfosGp().map((it) => {
        it.exchangeInfo = null;
        // it.bookInfo = null;
        return it;
      })
    );
    this.navCtrl.navigateRoot(
      `order-list?tabId=${ProductItemType.plane}&doRefresh=${result}`,
      {
        animated: true,
      }
    );
  }
  getTime(takofftime: string) {
    return this.calendarService.getHHmm(takofftime);
  }
  private async processExchange() {
    let result = false;
    try {
      const infos = this.flightGpService.getPassengerBookInfosGp();
      console.log(infos,'infos')
      const info: PassengerBookInfoGp = infos && infos[0];
      if (
        !info ||
        !info.Cabin ||
        !info.flightSegment
      ) {
        AppHelper.alert("改签失败，请重试");
        return false;
      }
      const trip: OrderFlightTripEntity = info.exchangeInfo
        .trip as OrderFlightTripEntity;
      const tips = [];
      const carrier = info.flightSegment.Number.substr(0, 2);
      if (
        carrier &&
        trip.Carrier &&
        trip.Carrier.toLowerCase() != carrier.toLowerCase()
      ) {
        tips.push(
          `所选航班承运人与旅客所持机票承运人不同，无法直接更改。需将所持机票退票（或将产生退票费），重新购买机票。`
        );
      } else if (
        trip.TicketPrice > info.Cabin.SalesPrice
      ) {
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
      if (ok) {
        result = await this.orderService
          .exchangeInfoFlightGpTrip(this.flightGpService.getPassengerBookInfosGp()[0])
          .then(() => true)
          .catch((e) => {
            AppHelper.alert(e);
            return false;
          });
        if (result) {
          AppHelper.toast("改签申请中", 2000, "middle");
        }
      }
    } catch (e) {
      console.error(e);
    }
    return result;
  }
  async nextStep() {
    if (this.flightGpService.checkIfTimeout()) {
      await this.flightGpService.showTimeoutPop(
        true,
        this.pageUrl
      );
      this.backbtn.popToPrePage();
      return;
    }
    const bookInfos = this.flightGpService
      .getPassengerBookInfosGp();
    // const isSelf = await this.staffService.isSelfBookType();
    // const s = this.flightService.getSearchFlightModel();
    // if (s.isRoundTrip && bookInfos.length == 1) {
    // const back = bookInfos.find(
    //   (it) => it.bookInfo.tripType == TripType.returnTrip
    // );
    // if (!back) {
    //   const ok = await AppHelper.alert(
    //     "您尚未选择回程",
    //     true,
    //     LanguageHelper.getConfirmTip(),
    //     LanguageHelper.getCancelTip()
    //   );
    //   if (!ok) {
    //     return;
    //   }
    // }
    // }
    this.flightGpService.dismissAllTopOverlays();
    this.router.navigate([AppHelper.getRoutePath("flight-gp-bookinfos")]);
  }
  // async reelect(info: PassengerBookInfoGp) {
  //   await this.flightService.reselectPassengerFlightSegments(info);
  // }
  canShowLowerSegment(info: PassengerBookInfo<IFlightSegmentInfo>) {
    if (this.flightGpService.getSearchFlightModel().isExchange) {
      return false;
    }
    const pfs = info.bookInfo;
    let show = !!(
      pfs &&
      pfs.lowerSegmentInfo &&
      pfs.lowerSegmentInfo.lowestFlightSegment
    );
    if (
      this.isSelf &&
      info.bookInfo &&
      info.bookInfo.tripType == TripType.returnTrip
    ) {
      const bookInfos = this.flightGpService.getPassengerBookInfosGp();
      // const goInfo = bookInfos.find(
      //   (it) => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
      // );
      // const goFlight =
      //   goInfo && goInfo.bookInfo && goInfo.bookInfo.flightSegment;
      // if (
      //   goFlight &&
      //   show &&
      //   // 来回的机场要对应才计算
      //   goFlight.FromAirport == info.bookInfo.flightSegment.ToAirport &&
      //   goFlight.ToAirport == info.bookInfo.flightSegment.FromAirport
      // ) {
      //   const arrivalTime = this.calendarService
      //     .getMoment(0, goFlight.ArrivalTime)
      //     .add(1, "hours");
      //   const loweerTime = this.calendarService.getMoment(
      //     0,
      //     pfs.lowerSegmentInfo.lowestFlightSegment.TakeoffTime
      //   );
      //   show = +loweerTime >= +arrivalTime;
      // }
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
  private async loadLowestCabin(info: PassengerBookInfo<IFlightSegmentInfo>) {
    try {
      if (info && info.bookInfo && info.bookInfo.lowerSegmentInfo) {
        const segs = this.flightGpService.getTotalFlySegments();
        const seg = segs.find(
          (it) =>
            it.Number ==
            info.bookInfo.lowerSegmentInfo.lowestFlightSegment.Number
        );
        if (!seg.Cabins || !seg.Cabins.length) {
          await this.flightGpService.initFlightSegmentCabins(seg);
        }
        if (seg.Cabins) {
          seg.Cabins.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
          info.bookInfo.lowerSegmentInfo.lowestCabin = {
            Cabin: seg.Cabins[0],
            CabinCode: seg.Cabins[0].Code,
            Rules: [],
            IsAllowBook: true,
            FlightNo: seg.Number,
          } as FlightPolicy;
          info.bookInfo.lowerSegmentInfo.lowestFlightSegment = {
            ...seg,
          };
          info.bookInfo.flightSegment = {
            ...seg,
          };
          return info.bookInfo.lowerSegmentInfo.lowestCabin;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }
  private checkIfAirportsChanged(info: PassengerBookInfo<IFlightSegmentInfo>) {
    const lowestFlightSegment =
      info.bookInfo.lowerSegmentInfo.lowestFlightSegment;
    const tip = [];
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
    return tip;
  }
  // async onSelectLowestSegment(info: PassengerBookInfo<IFlightSegmentInfo>) {
  //   try {
  //     let { lowestCabin, lowestFlightSegment } =
  //       info.bookInfo && info.bookInfo.lowerSegmentInfo;
  //     if (!lowestFlightSegment) {
  //       await AppHelper.alert(
  //         LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
  //       );
  //       return "";
  //     }
  //     if (!lowestCabin) {
  //       lowestCabin = await this.loadLowestCabin(info);
  //     }
  //     if (!lowestCabin) {
  //       await AppHelper.alert(
  //         LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
  //       );
  //       return "";
  //     }
  //     const tip = this.checkIfAirportsChanged(info);
  //     if (tip.length) {
  //       const ok = await AppHelper.alert(
  //         `${tip.join(";")}，是否继续？`,
  //         true,
  //         LanguageHelper.getConfirmTip(),
  //         LanguageHelper.getCancelTip()
  //       );
  //       if (!ok) {
  //         return;
  //       }
  //     }
  //     // 税费
  //     if (!lowestFlightSegment.Tax) {
  //       lowestFlightSegment.Tax = lowestCabin.Cabin.Tax;
  //     }
  //     const m = await this.modalCtrl.create({
  //       component: SelectFlightsegmentCabinComponent,
  //       componentProps: {
  //         policiedCabins: [lowestCabin],
  //         flightSegment: lowestFlightSegment,
  //         isAgent:
  //           this.identity &&
  //           this.identity.Numbers &&
  //           this.identity.Numbers["AgentId"],
  //       },
  //     });
  //     m.backdropDismiss = false;
  //     await this.flightService.dismissTopOverlay();
  //     await m.present();
  //     const result = await m.onDidDismiss();
  //     const data = info.bookInfo;
  //     if (result.data) {
  //       const cbin = result.data;
  //       if (!cbin) {
  //         await AppHelper.alert(
  //           LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
  //         );
  //       } else {
  //         const bookInfo: IFlightSegmentInfo = {
  //           flightPolicy: cbin,
  //           flightSegment: lowestFlightSegment,
  //           tripType: data.tripType,
  //           id: AppHelper.uuid(),
  //           lowerSegmentInfo: null,
  //           originalBookInfo: {
  //             ...info,
  //             bookInfo: {
  //               ...info.bookInfo,
  //               lowerSegmentInfo: null,
  //             },
  //           },
  //         };
  //         bookInfo.flightPolicy.LowerSegment = null; // 更低价仅能选择一次.
  //         const newInfo: PassengerBookInfo<IFlightSegmentInfo> = {
  //           id: AppHelper.uuid(),
  //           passenger: info.passenger,
  //           credential: info.credential,
  //           isNotWhitelist: info.isNotWhitelist,
  //           bookInfo,
  //           exchangeInfo: info.exchangeInfo,
  //         };
  //         this.flightService.replacePassengerBookInfo(info, newInfo);
  //       }
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  async remove(item: PassengerBookInfo<IFlightSegmentInfo>, message?: string) {
    const ok = await AppHelper.alert(
      message || LanguageHelper.Flight.getConfirmRemoveFlightSegmentTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (ok) {
      await this.flightGpService.removePassengerBookInfo(item, false);
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
    const isShow =
      info &&
      info.bookInfo &&
      info.bookInfo.flightPolicy.Rules &&
      info.bookInfo.flightPolicy &&
      info.bookInfo.flightPolicy.Rules.length;
    return (
      isShow &&
      info &&
      info.passenger &&
      info.passenger.Policy &&
      info.passenger.Policy.FlightIllegalTip
    );
  }
  getFlightlegalTip(info: PassengerBookInfo<IFlightSegmentInfo>) {
    const isShow =
      info &&
      info.bookInfo &&
      info.bookInfo.flightPolicy.Rules &&
      info.bookInfo.flightPolicy &&
      info.bookInfo.flightPolicy.Rules.length;
    return (
      !isShow &&
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
    return `[${info.tripType == TripType.departureTrip
      ? LanguageHelper.getDepartureTip()
      : LanguageHelper.getReturnTripTip()
      }]`;
  }

  async onSelectReturnTrip() {
    await this.flightGpService.onSelectReturnTrip();
  }
}
