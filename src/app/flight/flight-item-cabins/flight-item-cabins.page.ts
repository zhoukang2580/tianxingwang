import { MemberCredential } from "./../../member/member.service";
import { IdentityService } from "./../../services/identity/identity.service";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { StaffService, StaffEntity } from "../../hr/staff.service";
import { DayModel } from "./../models/DayModel";
import { FlydayService } from "./../flyday.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { ActivatedRoute, Router } from "@angular/router";
import {
  FlightService,
  FlightPolicy,
  PassengerFlightSelectedInfo,
  TripType,
  CheckSelfSelectedInfoType
} from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import {
  ModalController,
  AlertController,
  NavController
} from "@ionic/angular";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import * as moment from "moment";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectedFlightsegmentInfoComponent } from "../components/selected-flightsegment-info/selected-flightsegment-info.component";
import { SelectFlightsegmentCabinComponent } from "../components/select-flightsegment-cabin/select-flightsegment-cabin.component";

@Component({
  selector: "app-flight-item-cabins",
  templateUrl: "./flight-item-cabins.page.html",
  styleUrls: ["./flight-item-cabins.page.scss"]
})
export class FlightItemCabinsPage implements OnInit {
  vmFlightSegment: FlightSegmentEntity;
  flightSegment: {
    flightSegment: FlightSegmentEntity;
    flightSegments: FlightSegmentEntity[];
  };
  vmCabins: FlightPolicy[] = [];
  staff: StaffEntity;
  loading = true;
  constructor(
    private flightService: FlightService,
    activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private flydayService: FlydayService,
    private staffService: StaffService,
    private alertCtrl: AlertController,
    private identityService: IdentityService,
    private navCtrl: NavController,
    private router: Router
  ) {
    activatedRoute.queryParamMap.subscribe(async p => {
      this.flightSegment = flightService.getCurrentViewtFlightSegment();
      this.vmFlightSegment = this.flightSegment.flightSegment;
      const identity = await this.identityService.getIdentityAsync();
      this.staff = await this.staffService.getStaff();
      if (
        this.staff &&
        this.staff.BookType == StaffBookType.Self &&
        !this.staff.Name
      ) {
        this.staff.Name = identity.Name;
      }
    });
  }
  getMothDay() {
    const t =
      this.flightSegment &&
      moment(this.flightSegment.flightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.flydayService.generateDayModel(t);
    }
    return `${t && t.format("MM月DD日")} ${d && d.dayOfWeekName} `;
  }
  async onBookTicket(cabin: FlightPolicy) {
    let selectedInfos = this.flightService.getPassengerFlightSegments();
    console.log(
      "cabin.LowerSegment ",
      cabin.LowerSegment,
      "selectedInfo",
      selectedInfos,
      "cabin",
      cabin
    );
    if (cabin && cabin.LowerSegment) {
      const ok = await this.showSelectLowesetAlert(cabin);
      if (ok) {
        await this.onSelectLowestSegment(
          cabin,
          cabin.LowerSegment.LowestCabinCode
        );
      } else {
        const result = await this.flightService.addPassengerFlightSegments({
          passenger: this.staff,
          credential: new MemberCredential(),
          selectedInfo: [
            {
              flightPolicy: cabin,
              flightSegment: this.flightSegment.flightSegment,
              tripType: TripType.departureTrip
            }
          ]
        });
        const step = await this.showSelectedInfos();
      }
    } else {
      const result = await this.flightService.addPassengerFlightSegments({
        passenger: this.staff,
        credential: new MemberCredential(),
        selectedInfo: [
          {
            flightPolicy: cabin,
            flightSegment: this.flightSegment.flightSegment,
            tripType: TripType.departureTrip
          }
        ]
      });
      const step = await this.showSelectedInfos();
    }
  }
  async reelect(passenger: StaffEntity, item: PassengerFlightSelectedInfo) {
    await this.flightService.reselectPassengerFlightSegments(item.tripType);
  }
  private showSelectLowesetAlert(cabin: FlightPolicy) {
    return new Promise(async s => {
      const a = await this.alertCtrl.create({
        message: `${LanguageHelper.Flight.getHasLowerSegmentTip()} ${
          cabin.LowerSegment.Number
        } ${moment(cabin.LowerSegment.TakeoffTime).format(
          "HH:mm"
        )} ${LanguageHelper.CurrencySymbols.Yuan()}${
          cabin.LowerSegment.LowestFare
        }`,
        subHeader: LanguageHelper.Flight.getSelectTheSegmentTip(),
        buttons: [
          {
            text: LanguageHelper.getConfirmTip(),
            handler: () => {
              s(true);
            }
          },
          {
            text: LanguageHelper.getNegativeTip(),
            handler: async () => {
              s(false);
            },
            role: "cancel"
          }
        ]
      });
      a.backdropDismiss = false;
      await a.present();
    });
  }
  private async onSelectTripType(): Promise<TripType> {
    const ok = await AppHelper.alert(
      LanguageHelper.Flight.getTripTypeTip(),
      true,
      LanguageHelper.getReturnTripTip(),
      LanguageHelper.getDepartureTip()
    );
    if (ok) {
      return TripType.returnTrip;
    }
    return TripType.departureTrip;
  }
  async onSelectLowestSegment(cabin: FlightPolicy, lowestCabinCode: string) {
    const flightSegment = this.flightSegment.flightSegments.find(item => {
      return item.Number == cabin.LowerSegment.Number;
    });
    if (!flightSegment) {
      AppHelper.alert(LanguageHelper.Flight.getTheLowestSegmentNotFoundTip());
    } else {
      const lowestCabin = flightSegment.PoliciedCabins.find(
        c => c.CabinCode == lowestCabinCode
      );
      if (!lowestCabin) {
        await AppHelper.alert(
          LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
        );
        return "reset";
      }
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
          const res = await this.flightService.addPassengerFlightSegments({
            passenger: this.staff,
            credential: new MemberCredential(),
            selectedInfo: [
              {
                flightPolicy: cbin,
                flightSegment: flightSegment
              }
            ]
          });
          console.log(
            "onSelectLowestSegment addPassengerFlightSegments result",
            res
          );
        }
      }
      const step = await this.showSelectedInfos();
    }
  }
  async showSelectedInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent
    });
    await modal.present();
    await modal.onDidDismiss();
    return "goBack";
  }
  async openrules(cabin: any) {
    this.modalCtrl.dismiss().catch(_ => {});
    const m = await this.modalCtrl.create({
      component: TicketchangingComponent,
      componentProps: { cabin: cabin.Cabin },
      showBackdrop: true,
      cssClass: "ticket-changing"
    });
    m.backdropDismiss = false;
    await m.present();
  }
  bookColor(cabin: any) {
    if (cabin && cabin.Rules) {
      if (cabin.Rules.length) {
        if (!cabin.IsAllowBook) {
          return "danger";
        }
        return "warning";
      }
      return "success";
    }
    return "primary";
  }
  ngOnInit() {
    if (this.flightSegment) {
      this.loading = true;
      const cabins = (
        this.flightSegment.flightSegment.PoliciedCabins || []
      ).slice(0);
      const loop = () => {
        if (cabins.length) {
          this.vmCabins.push(...cabins.splice(0, 1));
          window.requestAnimationFrame(loop);
        } else {
          this.loading = false;
        }
      };
      setTimeout(() => {
        loop();
      }, 500);
    }
  }
}
