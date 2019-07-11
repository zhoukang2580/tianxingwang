import { IdentityService } from "./../../services/identity/identity.service";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { HrService, StaffEntity } from "./../../hr/hr.service";
import { DayModel } from "./../models/DayModel";
import { FlydayService } from "./../flyday.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { ActivatedRoute } from "@angular/router";
import { FlightService, FlightPolicy } from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import {
  ModalController,
  DomController,
  AlertController
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
    private hrService: HrService,
    private alertCtrl: AlertController,
    private identityService: IdentityService
  ) {
    activatedRoute.queryParamMap.subscribe(async p => {
      this.flightSegment = flightService.getCurrentViewtFlightSegment();
      this.vmFlightSegment = this.flightSegment.flightSegment;
      const identity = await this.identityService.getIdentityPromise();
      this.staff = await this.hrService.getStaff();
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
    if (this.staff.BookType == StaffBookType.Self) {
      selectedInfos = selectedInfos.filter(info => info.selectedInfo.length);
      // if (
      //   selectedInfos.length &&
      //   selectedInfos.some(info => info.selectedInfo.length > 0)
      // ) {
      //   const one = selectedInfos.find(info => info.selectedInfo.length > 0);
      //   const identity = await this.identityService.getIdentityPromise();
      //   if (!one.passenger.Name) {
      //     one.passenger.Name = identity.Name;
      //   }
      //   const step = await this.showSelectedInfos();
      //   await this.process(step);
      // }
      if (cabin && cabin.LowerSegment) {
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
              handler: async () => {
                await this.onSelectLowestSegment(
                  cabin,
                  cabin.LowerSegment.LowestCabinCode
                );
              }
            },
            {
              text: LanguageHelper.getNegativeTip(),
              handler: async () => {
                this.flightService.addPassengerFlightSegments({
                  passenger: this.staff,
                  selectedInfo: [
                    {
                      flightPolicy: cabin,
                      flightSegment: this.flightSegment.flightSegment
                    }
                  ]
                });
                const step = await this.showSelectedInfos();
                await this.process(step);
              },
              role: "cancel"
            }
          ]
        });
        a.backdropDismiss = false;
        await a.present();
      } else {
        const identity = await this.identityService.getIdentityPromise();
        if (!this.staff.Name) {
          this.staff.Name = identity.Name;
        }
        this.flightService.removeAllPassengerFlightSegments();
        this.flightService.addPassengerFlightSegments({
          passenger: this.staff,
          selectedInfo: [
            {
              flightPolicy: cabin,
              flightSegment: this.flightSegment.flightSegment
            }
          ]
        });
        const step = await this.showSelectedInfos();
        await this.process(step);
      }
    } else {
      // this.flightService
    }
  }
  async process(step: "reset" | "nextStep" | "goBack") {
    if (step == "goBack") {
      return step;
    }
    if (step == "reset") {
      this.flightService.removePassengerFlightSegments(
        this.flightService
          .getPassengerFlightSegments()
          .filter(item => item.selectedInfo.some(info => info.reset))
      );
    }
    if (step == "nextStep") {
      this.modalCtrl.dismiss().catch(_ => {});
    }
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
        AppHelper.alert(LanguageHelper.Flight.getTheLowestCabinNotFoundTip());
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
          AppHelper.alert(LanguageHelper.Flight.getTheLowestCabinNotFoundTip());
        } else {
          this.flightService.removeAllPassengerFlightSegments();
          this.flightService.addPassengerFlightSegments({
            passenger: this.staff,
            selectedInfo: [
              {
                flightPolicy: cbin,
                flightSegment: flightSegment
              }
            ]
          });
          const step = await this.showSelectedInfos();
          await this.process(step);
        }
      }
    }
  }
  async showSelectedInfos(): Promise<"reset" | "nextStep" | "goBack"> {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent,
      componentProps: {
        selectedInfos: this.flightService.getPassengerFlightSegments()
      }
    });
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result.data) {
      if (result.data.reset) {
        this.flightService.removeAllPassengerFlightSegments();
        return "reset";
      }
      if (result.data.nextStep) {
        return "nextStep";
      }
    }
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
