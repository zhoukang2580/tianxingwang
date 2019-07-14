import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { FlydayService } from "./../../flyday.service";
import { AppHelper } from "./../../../appHelper";
import { StaffEntity } from "src/app/hr/staff.service";
import { StaffBookType } from "./../../../tmc/models/StaffBookType";
import { HrService } from "../../../hr/staff.service";
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
import { tap } from "rxjs/operators";
@Component({
  selector: "app-selected-flightsegment-info",
  templateUrl: "./selected-flightsegment-info.component.html",
  styleUrls: ["./selected-flightsegment-info.component.scss"]
})
export class SelectedFlightsegmentInfoComponent implements OnInit {
  selectedInfos$: Observable<PassengerFlightSegments[]>;
  selectedInfos: PassengerFlightSelectedInfo[];
  identity: IdentityEntity;
  showSelectReturnTripButton = false;
  constructor(
    private modalCtrl: ModalController,
    private flightService: FlightService,
    private alertController: AlertController,
    private flydayService: FlydayService,
    private hrService: HrService,
    private router: Router,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.selectedInfos$ = this.flightService
      .getPassengerFlightSegmentSource()
      .pipe(
        tap(async info => {
          const s = await this.hrService.getStaff();
          if (s.BookType == StaffBookType.Self) {
            const one = info.find(item => item.passenger == s);
            if (one) {
              this.selectedInfos = one.selectedInfo;
            }
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
    if (this.selectedInfos.length === 0) {
      this.back();
    }
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
    s.tripType = TripType.returnTrip;
    const goflight = this.selectedInfos.find(
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
