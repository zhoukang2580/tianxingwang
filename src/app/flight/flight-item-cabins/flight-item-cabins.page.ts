import { HrService, StaffEntity } from "./../../hr/hr.service";
import { DayModel } from "./../models/DayModel";
import { FlydayService } from "./../flyday.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { ActivatedRoute } from "@angular/router";
import { FlightService } from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import { ModalController, DomController } from "@ionic/angular";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import * as moment from "moment";
@Component({
  selector: "app-flight-item-cabins",
  templateUrl: "./flight-item-cabins.page.html",
  styleUrls: ["./flight-item-cabins.page.scss"]
})
export class FlightItemCabinsPage implements OnInit {
  flightSegment: FlightSegmentEntity;
  staff: StaffEntity;
  constructor(
    private flightService: FlightService,
    private activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private flydayService: FlydayService,
    private hrService: HrService
  ) {
    activatedRoute.queryParamMap.subscribe(async p => {
      this.flightSegment = flightService.getCurrentViewtFlightSegment();
      this.staff = await this.hrService.getStaff();
    });
  }
  getMothDay() {
    const t = this.flightSegment && moment(this.flightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.flydayService.generateDayModel(t);
    }
    return `${t && t.format("MM月DD日")} ${d && d.dayOfWeekName} `;
  }
  onBookTicket() {}
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
    if ("Rules" in cabin && cabin.Rules.length) {
      return "warning";
    }
    if ("Rules" in cabin && cabin.Rules.length && !cabin.IsAllowBook) {
      return "danger";
    }
    return "success";
  }
  ngOnInit() {}
}
