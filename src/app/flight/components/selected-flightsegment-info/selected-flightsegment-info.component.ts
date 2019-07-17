import { CurrentViewtFlightSegment } from "./../../flight.service";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { FlydayService } from "./../../flyday.service";
import { AppHelper } from "./../../../appHelper";
import { StaffEntity } from "src/app/hr/staff.service";
import { StaffBookType } from "./../../../tmc/models/StaffBookType";
import { StaffService } from "../../../hr/staff.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import {
  ModalController,
  AlertController,
  NavController
} from "@ionic/angular";
import {
  FlightPolicy,
  PassengerFlightSegments,
  PassengerFlightSelectedInfo,
  FlightService,
  TripType
} from "src/app/flight/flight.service";
import { FlightSegmentEntity } from "./../../models/flight/FlightSegmentEntity";
import { Component, OnInit } from "@angular/core";
import { LanguageHelper } from "src/app/languageHelper";
import * as moment from "moment";
import { tap, map } from "rxjs/operators";
import { MemberCredential } from "src/app/member/member.service";
import { SelectFlightsegmentCabinComponent } from "../select-flightsegment-cabin/select-flightsegment-cabin.component";
@Component({
  selector: "app-selected-flightsegment-info",
  templateUrl: "./selected-flightsegment-info.component.html",
  styleUrls: ["./selected-flightsegment-info.component.scss"]
})
export class SelectedFlightsegmentInfoComponent implements OnInit {
  selectedInfos$: Observable<PassengerFlightSegments[]>;
  // selectedInfos: PassengerFlightSelectedInfo[];
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

  async ngOnInit() {
    this.currentViewtFlightSegment = this.flightService.getCurrentViewtFlightSegment();
    this.selectedInfos$ = this.flightService
      .getPassengerFlightSegmentSource()
      .pipe(
        tap(async info => {
          const s = await this.staffService.getStaff();
          if (s.BookType == StaffBookType.Self) {
            const one = info.find(item => item.passenger == s);
            this.showSelectReturnTripButton =
              one &&
              this.flightService.getSearchFlightModel().IsRoundTrip &&
              one.selectedInfo.length < 2 &&
              !one.selectedInfo.find(
                item => item.tripType == TripType.returnTrip
              );
          } else {
            this.showSelectReturnTripButton = false;
          }
        })
      );
  }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => {});
    }
  }
  async nextStep() {}
  async reelect(passenger: StaffEntity, item: PassengerFlightSelectedInfo) {
    await this.flightService.reselectPassengerFlightSegments(item.tripType);
  }
  async onSelectLowestSegment(
    info: PassengerFlightSegments,
    data: PassengerFlightSelectedInfo
  ) {
    const flights = this.currentViewtFlightSegment.flightSegments;
    const onePolicyFlights = this.currentViewtFlightSegment.policyFlights.find(
      item => item.PassengerKey == info.passenger.AccountId
    );
    const flightSegment = flights.find(
      fs => fs.Number == data.flightPolicy.LowerSegment.Number
    );
    if (!flightSegment || !onePolicyFlights) {
      AppHelper.alert(LanguageHelper.Flight.getTheLowestSegmentNotFoundTip());
    } else {
      const lowestCabin = onePolicyFlights.FlightPolicies.find(
        c =>
          c.CabinCode == data.flightPolicy.LowerSegment.LowestCabinCode &&
          c.FlightNo == flightSegment.Number
      );
      if (!lowestCabin) {
        await AppHelper.alert(
          LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
        );
        return "";
      }
      lowestCabin.Cabin = flightSegment.Cabins.find(
        c => c.Code == lowestCabin.CabinCode
      );
      const m = await this.modalCtrl.create({
        component: SelectFlightsegmentCabinComponent,
        componentProps: {
          policiedCabins: [lowestCabin],
          flightSegment
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
          const newOne: PassengerFlightSelectedInfo = {
            flightPolicy: cbin,
            flightSegment: flightSegment
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

  async remove(
    passenger: StaffEntity,
    item: PassengerFlightSelectedInfo,
    message?: string
  ) {
    const al = await this.alertController.create({
      header: LanguageHelper.getHintTip(),
      message:
        message || LanguageHelper.Flight.getConfirmRemoveFlightSegmentTip(),
      buttons: [
        {
          text: LanguageHelper.getConfirmTip(),
          handler: () => {
            if (item.tripType == TripType.departureTrip) {
              this.reelect(passenger, item);
            } else {
              this.flightService.removePassengerFlightSelectedInfo(passenger, [
                item
              ]);
              if (al) {
                al.dismiss();
              }
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
  getTripTip(info: PassengerFlightSelectedInfo) {
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
    const selectedInfos = this.flightService.getPassengerFlightSegments()[0]
      .selectedInfo;
    s.tripType = TripType.returnTrip;
    const goflight = selectedInfos.find(
      item => item.tripType == TripType.departureTrip
    ).flightSegment;
    const fromCity = airports.find(c => c.Code == goflight.FromAirport);
    const toCity = airports.find(c => c.Code == goflight.ToAirport);
    s.fromCity = fromCity;
    s.toCity = toCity;
    const goDay = moment(goflight.ArrivalTime);
    let backDay = moment(s.BackDate);
    if (+backDay < +moment(goDay.add(3, "hours").format("YYYY-MM-DD"))) {
      backDay = goDay.add(3, "hours");
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
        Date: s.BackDate
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
