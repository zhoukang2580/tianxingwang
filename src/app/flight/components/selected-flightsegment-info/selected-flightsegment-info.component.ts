import { CredentialsEntity } from "./../../../tmc/models/CredentialsEntity";
import { SearchFlightModel } from "./../../flight.service";
import { Observable, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { CalendarService } from "../../../tmc/calendar.service";
import { AppHelper } from "./../../../appHelper";
import { StaffEntity, StaffBookType } from "src/app/hr/staff.service";
import { StaffService } from "../../../hr/staff.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import {
  ModalController,
  AlertController,
  NavController
} from "@ionic/angular";
import { FlightService } from "src/app/flight/flight.service";
import { FlightSegmentEntity } from "./../../models/flight/FlightSegmentEntity";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { LanguageHelper } from "src/app/languageHelper";
import * as moment from "moment";
import { tap, map, reduce } from "rxjs/operators";
import { SelectFlightsegmentCabinComponent } from "../select-flightsegment-cabin/select-flightsegment-cabin.component";
import { TripType } from "src/app/tmc/models/TripType";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import {
  CurrentViewtFlightSegment,
  PassengerFlightSegmentInfo
} from "../../models/PassengerFlightInfo";
interface PassengerBookInfos {
  passenger: StaffEntity;
  credential: CredentialsEntity;
  bookInfos: PassengerBookInfo[];
}
@Component({
  selector: "app-selected-flightsegment-info",
  templateUrl: "./selected-flightsegment-info.component.html",
  styleUrls: ["./selected-flightsegment-info.component.scss"]
})
export class SelectedFlightsegmentInfoComponent implements OnInit, OnDestroy {
  passengerAndBookInfos$: Observable<PassengerBookInfos[]>;
  searchModel: SearchFlightModel;
  searchModelSubscrition = Subscription.EMPTY;
  identity: IdentityEntity;
  showSelectReturnTripButton = false;
  currentViewtFlightSegment: CurrentViewtFlightSegment;
  constructor(
    private modalCtrl: ModalController,
    private flightService: FlightService,
    private alertController: AlertController,
    private flydayService: CalendarService,
    private staffService: StaffService,
    private router: Router,
    private navCtrl: NavController
  ) {}
  ngOnDestroy() {
    this.searchModelSubscrition.unsubscribe();
  }
  async ngOnInit() {
    this.searchModelSubscrition = this.flightService
      .getSearchFlightModelSource()
      .subscribe(m => {
        this.searchModel = m;
      });
    this.currentViewtFlightSegment = this.flightService.getCurrentViewtFlightSegment();
    this.passengerAndBookInfos$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(
        tap(infos => {
          if (this.staffService.isSelfBookType) {
            const goinfo = infos.find(
              item =>
                item.flightSegmentInfo &&
                item.flightSegmentInfo.tripType == TripType.departureTrip
            );
            const backInfo = infos.find(
              item =>
                item.flightSegmentInfo &&
                item.flightSegmentInfo.tripType == TripType.returnTrip
            );
            if (goinfo && backInfo) {
              this.showSelectReturnTripButton = false;
            }
            this.showSelectReturnTripButton =
              this.flightService.getSearchFlightModel().isRoundTrip &&
              goinfo &&
              !backInfo;
          } else {
            this.showSelectReturnTripButton = false;
          }
        }),
        map(infos => {
          const acc = [] as PassengerBookInfos[];
          const tempObj: { [key: string]: PassengerBookInfo[] } = {} as any;
          infos.forEach(item => {
            if (tempObj[item.passenger.AccountId]) {
              tempObj[item.passenger.AccountId].push(item);
            } else {
              tempObj[item.passenger.AccountId] = [item];
            }
          });
          Object.keys(tempObj).map(k => {
            const one = infos.find(it => it.passenger.AccountId == k);
            if (one) {
              acc.push({
                passenger: one.passenger,
                credential: one.credential,
                bookInfos: tempObj[k]
              });
            }
          });
          console.log("reduce", acc);
          return acc;
        }),
        tap(res => {
          console.log("bookInfos", res);
        })
      );
  }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => {});
    }
  }
  getTime(takofftime: string) {
    if (takofftime && takofftime.includes("T")) {
      return moment(takofftime).format(" HH:mm ");
    }
    return takofftime;
  }
  async nextStep() {
    this.flightService.dismissAllTopOverlays();
    this.router.navigate([AppHelper.getRoutePath("flight-book")]);
  }
  async reelect(info: PassengerBookInfo) {
    await this.flightService.reselectPassengerFlightSegments(info);
  }
  showLowerSegment(info: PassengerBookInfo) {
    const pfs = info.flightSegmentInfo;
    return (
      pfs &&
      pfs.flightPolicy &&
      pfs.flightPolicy.LowerSegment &&
      !pfs.isLowerSegmentSelected &&
      ((info.flightSegmentInfo &&
        this.searchModel.tripType !== TripType.returnTrip) ||
        pfs.tripType == TripType.returnTrip)
    );
  }
  async onSelectLowestSegment(old: PassengerBookInfo) {
    if (!old || !old.flightSegmentInfo) {
      return "";
    }
    if (old.flightSegmentInfo.isLowerSegmentSelected) {
      AppHelper.alert("已经选择过更低航班");
      return;
    }
    const data = old.flightSegmentInfo;
    const flights = this.currentViewtFlightSegment.flightSegments;
    const onePolicyFlights = this.currentViewtFlightSegment.totalPolicyFlights.find(
      item => item.PassengerKey == old.passenger.AccountId
    );
    const lowestFlightSegment = flights.find(
      fs => fs.Number == data.flightPolicy.LowerSegment.Number
    );
    if (!lowestFlightSegment || !onePolicyFlights) {
      AppHelper.alert(LanguageHelper.Flight.getTheLowestSegmentNotFoundTip());
    } else {
      const lowestCabin = onePolicyFlights.FlightPolicies.find(
        c =>
          c.CabinCode == data.flightPolicy.LowerSegment.LowestCabinCode &&
          c.FlightNo == lowestFlightSegment.Number
      );
      if (!lowestCabin) {
        await AppHelper.alert(
          LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
        );
        return "";
      }
      lowestCabin.Cabin = lowestFlightSegment.Cabins.find(
        c => c.Code == lowestCabin.CabinCode
      );
      const m = await this.modalCtrl.create({
        component: SelectFlightsegmentCabinComponent,
        componentProps: {
          policiedCabins: [lowestCabin],
          flightSegment: lowestFlightSegment
        }
      });
      m.backdropDismiss = false;
      await this.flightService.dismissTopOverlay();
      await m.present();
      const result = await m.onDidDismiss();
      if (result.data) {
        const cbin = result.data;
        if (!cbin) {
          await AppHelper.alert(
            LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
          );
        } else {
          const flightSegmentInfo: PassengerFlightSegmentInfo = {
            flightPolicy: cbin,
            flightSegment: lowestFlightSegment,
            tripType: data.tripType || TripType.departureTrip,
            id: AppHelper.uuid(),
            isLowerSegmentSelected: true
          };
          const newInfo: PassengerBookInfo = {
            id: AppHelper.uuid(),
            passenger: old.passenger,
            credential: old.credential,
            isNotWhitelist: old.isNotWhitelist,
            flightSegmentInfo
          };
          this.flightService.replacePassengerBookInfo(old, newInfo);
        }
      }
    }
  }

  async remove(item: PassengerBookInfo, message?: string) {
    const al = await this.alertController.create({
      header: LanguageHelper.getHintTip(),
      message:
        message || LanguageHelper.Flight.getConfirmRemoveFlightSegmentTip(),
      buttons: [
        {
          text: LanguageHelper.getConfirmTip(),
          handler: async () => {
            await this.flightService.removePassengerBookInfo(item);
            if (al) {
              al.dismiss();
            }
          }
        },
        {
          text: LanguageHelper.getCancelTip(),
          handler: () => {}
        }
      ]
    });
    al.backdropDismiss = false;
    await al.present();
    await al.onDidDismiss();
  }
  getDate(s: FlightSegmentEntity) {
    if (!s) {
      return "";
    }
    const day = this.flydayService.generateDayModel(moment(s.TakeoffTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getTripTypeTip(info: PassengerFlightSegmentInfo) {
    if (!info) {
      return "";
    }
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
    }]`;
  }

  async onSelectReturnTrip() {
    console.log("onSelectReturnTrip");
    if (!this.router.routerState.snapshot.url.includes("flight-list")) {
      this.navCtrl.back({
        animated: false
      });
    }
    await this.flightService.dismissAllTopOverlays();
    const s = this.flightService.getSearchFlightModel();
    const airports = await this.flightService.getAllLocalAirports();
    const bookInfos = this.flightService.getPassengerBookInfos();
    if (bookInfos.length < 2) {
      await this.flightService.addOneBookInfoToSelfBookType();
    }
    s.tripType = TripType.returnTrip;
    const goflightBookInfo = bookInfos.find(
      item =>
        item.flightSegmentInfo &&
        item.flightSegmentInfo.tripType == TripType.departureTrip
    );
    if (
      !goflightBookInfo ||
      !goflightBookInfo.flightSegmentInfo ||
      !goflightBookInfo.flightSegmentInfo.flightSegment
    ) {
      AppHelper.alert(LanguageHelper.Flight.getPlsSelectGoFlightTip());
      return;
    }
    const goflight = goflightBookInfo.flightSegmentInfo.flightSegment;
    const fromCity = airports.find(c => c.Code == goflight.FromAirport);
    const toCity = airports.find(c => c.Code == goflight.ToAirport);
    s.fromCity = fromCity;
    s.toCity = toCity;
    const goDay = moment(goflight.ArrivalTime);
    let backDay = moment(s.BackDate);
    if (+backDay < +moment(goDay.format("YYYY-MM-DD"))) {
      backDay = goDay;
    }
    s.BackDate = backDay.format("YYYY-MM-DD");
    this.flightService.dismissAllTopOverlays();
    console.log(
      "this.router.routerState.snapshot.url " +
        this.router.routerState.snapshot.url
    );
    this.router.navigate([AppHelper.getRoutePath("flight-list")]).then(_ => {
      this.flightService.setSearchFlightModel({
        ...s,
        FromCode: goflight.ToAirport,
        ToCode: goflight.FromAirport,
        ToAsAirport: s.FromAsAirport,
        FromAsAirport: s.ToAsAirport,
        fromCity: s.toCity,
        toCity: s.fromCity,
        Date: s.BackDate,
        tripType: TripType.returnTrip
      });
    });
  }
}
