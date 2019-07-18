import { FlightCabinEntity } from "./../models/flight/FlightCabinEntity";
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
  CheckSelfSelectedInfoType,
  CurrentViewtFlightSegment
} from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import {
  ModalController,
  AlertController,
  NavController,
  PopoverController
} from "@ionic/angular";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import * as moment from "moment";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectedFlightsegmentInfoComponent } from "../components/selected-flightsegment-info/selected-flightsegment-info.component";
import { SelectFlightsegmentCabinComponent } from "../components/select-flightsegment-cabin/select-flightsegment-cabin.component";
import { SelectedPassengersPopoverComponent } from "../components/selected-passengers-popover/selected-passengers-popover.component";

@Component({
  selector: "app-flight-item-cabins",
  templateUrl: "./flight-item-cabins.page.html",
  styleUrls: ["./flight-item-cabins.page.scss"]
})
export class FlightItemCabinsPage implements OnInit {
  vmFlightSegment: FlightSegmentEntity;
  currentViewtFlightSegment: CurrentViewtFlightSegment;
  vmCabins: FlightCabinEntity[] = [];
  vmPolicyCabins: FlightPolicy[] = [];
  showPolicyCabins = false;
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
    private router: Router,
    private popoverController: PopoverController
  ) {
    activatedRoute.queryParamMap.subscribe(async p => {
      this.currentViewtFlightSegment = flightService.getCurrentViewtFlightSegment();
      this.vmFlightSegment = this.currentViewtFlightSegment.flightSegment;
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
      this.currentViewtFlightSegment &&
      moment(this.currentViewtFlightSegment.flightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.flydayService.generateDayModel(t);
    }
    return `${t && t.format("MM月DD日")} ${d && d.dayOfWeekName} `;
  }
  async onBookTicket(flightCabin: FlightCabinEntity) {
    await this.flightService.addToUnselectOrReselecteInfos(flightCabin);
    await this.showSelectedInfos();
  }
  async filterPolicyFlights() {
    const popover = await this.popoverController.create({
      component: SelectedPassengersPopoverComponent,
      translucent: true
      // backdropDismiss: false
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    if (d && d.data) {
      const one = this.currentViewtFlightSegment.totalPolicyFlights.find(
        item => item.PassengerKey == d.data
      );
      if (one) {
        this.vmPolicyCabins = one.FlightPolicies.filter(
          pc =>
            pc.FlightNo == this.vmFlightSegment.Number && pc.Rules.length == 0
        );
      } else {
        this.vmPolicyCabins = [];
      }
      this.showPolicyCabins = true;
    } else {
      this.showPolicyCabins = false;
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
    if (this.currentViewtFlightSegment) {
      this.loading = true;
      const cabins = (
        this.currentViewtFlightSegment.flightSegment.Cabins || []
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
