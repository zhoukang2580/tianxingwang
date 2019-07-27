import { CredentialsEntity } from "./../../../tmc/models/CredentialsEntity";
import {
  CurrentViewtFlightSegment,
  SearchFlightModel
} from "./../../flight.service";
import { Observable, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { FlydayService } from "./../../flyday.service";
import { AppHelper } from "./../../../appHelper";
import { StaffEntity, StaffBookType } from "src/app/hr/staff.service";
import { StaffService } from "../../../hr/staff.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import {
  ModalController,
  AlertController,
  NavController
} from "@ionic/angular";
import {
  PassengerBookInfo,
  PassengerFlightSegmentInfo,
  FlightService,
  TripType
} from "src/app/flight/flight.service";
import { FlightSegmentEntity } from "./../../models/flight/FlightSegmentEntity";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { LanguageHelper } from "src/app/languageHelper";
import * as moment from "moment";
import { tap, map, reduce } from "rxjs/operators";
import { SelectFlightsegmentCabinComponent } from "../select-flightsegment-cabin/select-flightsegment-cabin.component";
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
  selectedInfos$: Observable<PassengerBookInfos[]>;
  searchModel: SearchFlightModel;
  searchModelSubscrition = Subscription.EMPTY;
  identity: IdentityEntity;
  showSelectReturnTripButton = false;
  currentViewtFlightSegment: CurrentViewtFlightSegment;
  constructor(
    private modalCtrl: ModalController,
    private flightService: FlightService,
    private alertController: AlertController,
    private flydayService: FlydayService,
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
    this.selectedInfos$ = this.flightService.getPassengerBookInfoSource().pipe(
      tap(async infos => {
        const s = await this.staffService.getStaff();
        if (s.BookType == StaffBookType.Self) {
          const oneInfos = infos.filter(
            item => item.passenger.AccountId == s.AccountId
          );
          this.showSelectReturnTripButton =
            this.flightService.getSearchFlightModel().IsRoundTrip &&
            !!oneInfos.find(
              info =>
                info.flightSegmentInfo &&
                info.flightSegmentInfo.tripType == TripType.departureTrip
            );
        } else {
          this.showSelectReturnTripButton = false;
        }
      }),
      reduce(
        (acc, infos) => {
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
          console.log("reduce",acc);
          return acc;
        },
        [] as PassengerBookInfos[]
      ),
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
    this.dismissTop();
    this.router.navigate([AppHelper.getRoutePath("book")]);
  }
  async reelect(passenger: StaffEntity, item: PassengerFlightSegmentInfo) {
    await this.flightService.reselectPassengerFlightSegments(passenger, item);
  }
  showLowerSegment(info: PassengerBookInfo, s: PassengerFlightSegmentInfo) {
    return (
      s &&
      s.flightPolicy &&
      s.flightPolicy.LowerSegment &&
      !s.hasLowerSegment &&
      ((info.flightSegmentInfo &&
        this.searchModel.tripType !== TripType.returnTrip) ||
        s.tripType == TripType.returnTrip)
    );
  }
  async onSelectLowestSegment(
    info: PassengerBookInfo,
    data: PassengerFlightSegmentInfo
  ) {
    if (data.hasLowerSegment) {
      AppHelper.alert("已经选择过更低航班");
      return;
    }
    const flights = this.currentViewtFlightSegment.flightSegments;
    const onePolicyFlights = this.currentViewtFlightSegment.totalPolicyFlights.find(
      item => item.PassengerKey == info.passenger.AccountId
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
      await m.present();
      const result = await m.onDidDismiss();
      if (result.data) {
        const cbin = result.data;
        if (!cbin) {
          await AppHelper.alert(
            LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
          );
        } else {
          const newOne: PassengerFlightSegmentInfo = {
            flightPolicy: cbin,
            flightSegment: lowestFlightSegment,
            tripType: data.tripType || TripType.departureTrip,
            id: AppHelper.uuid(),
            hasLowerSegment: true
          };
          this.flightService.replacePassengerFlightSelectedInfo(
            info.passenger,
            data,
            newOne
          );
        }
      }
    }
  }

  async remove(item: PassengerFlightSegmentInfo, message?: string) {
    const al = await this.alertController.create({
      header: LanguageHelper.getHintTip(),
      message:
        message || LanguageHelper.Flight.getConfirmRemoveFlightSegmentTip(),
      buttons: [
        {
          text: LanguageHelper.getConfirmTip(),
          handler: () => {
            this.flightService.removePassengerFlightSegmentInfo(item);
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
    const day = this.flydayService.generateDayModel(moment(s.TakeoffTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getTripTip(info: PassengerFlightSegmentInfo) {
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
    }]`;
  }

  async onSelectReturnTrip() {
    console.log("onSelectReturnTrip");
    const s = this.flightService.getSearchFlightModel();
    const airports = await this.flightService.getAllLocalAirports();
    const bookInfos = this.flightService.getPassengerBookInfos();
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
    await this.dismissTop();
    if (!this.router.routerState.snapshot.url.includes("flight-list")) {
      this.navCtrl.back();
    }
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
  private async dismissTop() {
    let top = await this.modalCtrl.getTop();
    let i = 10;
    while (top && --i > 0) {
      console.log("onSelectReturnTrip", top);
      await top.dismiss().catch(_ => {});
      top = await this.modalCtrl.getTop();
    }

    return true;
  }
}
