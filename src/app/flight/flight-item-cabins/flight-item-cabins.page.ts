import { FlightCabinEntity } from "./../models/flight/FlightCabinEntity";
import { IdentityService } from "./../../services/identity/identity.service";
import {
  StaffService,
  StaffEntity,
  StaffBookType
} from "../../hr/staff.service";
import { DayModel } from "../../tmc/models/DayModel";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { ActivatedRoute, Router } from "@angular/router";
import { FlightService } from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import {
  ModalController,
  AlertController,
  NavController,
  PopoverController
} from "@ionic/angular";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import * as moment from "moment";
import { SelectedFlightsegmentInfoComponent } from "../components/selected-flightsegment-info/selected-flightsegment-info.component";
import { FilterPassengersPolicyComponent } from "../../tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import {
  CurrentViewtFlightSegment,
  FlightPolicy
} from "../models/PassengerFlightInfo";

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
  isShowPolicyCabins = false;
  staff: StaffEntity;
  loading = true;
  constructor(
    private flightService: FlightService,
    activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private flydayService: CalendarService,
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
        this.staff.Name = identity && identity.Name;
      }
    });
  }
  back() {
    this.navCtrl.back();
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
    this.flightService.addOrReplaceSegmentInfo(flightCabin);
    await this.showSelectedInfos();
  }
  async filterPolicyFlights() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      translucent: true,
      componentProps: {
        bookInfos$: this.flightService.getPassengerBookInfoSource()
      }
      // backdropDismiss: false
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    if (d && d.data) {
      // console.log("filterPolicyFlights", d.data);
      const one = this.currentViewtFlightSegment.totalPolicyFlights.find(
        item => item.PassengerKey == d.data
      );
      if (one) {
        this.vmPolicyCabins = one.FlightPolicies.filter(
          pc =>
            pc.FlightNo == this.vmFlightSegment.Number &&
            (!pc.Rules || pc.Rules.length == 0)
        );
      } else {
        this.vmPolicyCabins = [];
      }
      this.isShowPolicyCabins = true;
    } else {
      this.isShowPolicyCabins = false;
      if (this.staffService.isSelfBookType) {
        this.isShowPolicyCabins = true;
        this.showPolicyCabins();
      }
    }
  }
  async showSelectedInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent
    });
    await this.flightService.dismissAllTopOverlays();
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
  async ngOnInit() {
    setTimeout(async() => {
      if (await this.staffService.checkStaffTypeSelf()) {
        this.isShowPolicyCabins = true;
        this.showPolicyCabins();
      } else {
        this.isShowPolicyCabins = false;
        this.showFlightCabins();
      }
    }, 800);
  }
  private showPolicyCabins() {
    this.vmPolicyCabins = [];
    if (this.currentViewtFlightSegment) {
      this.loading = true;
      const cabins = (
        this.currentViewtFlightSegment.flightSegment.PoliciedCabins || []
      ).slice(0);
      const loop = () => {
        if (cabins.length) {
          this.vmPolicyCabins.push(...cabins.splice(0, 1));
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
  private showFlightCabins() {
    this.vmCabins = [];
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
