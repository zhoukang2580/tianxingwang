import { CalendarService } from "./../../../tmc/calendar.service";
import { OrderFlightTicketEntity } from "src/app/order/models/OrderFlightTicketEntity";
import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";
import { Component, OnInit, Input } from "@angular/core";
import * as moment from "moment";
import { PopoverController } from "@ionic/angular";
import { TripRulePopoverComponent } from "src/app/order/components/trip-rule-popover/trip-rule-popover.component";

@Component({
  selector: "app-flight-original-trip",
  templateUrl: "./flight-original-trip.component.html",
  styleUrls: ["./flight-original-trip.component.scss"]
})
export class FlightOriginalTripComponent implements OnInit {
  @Input() trips: OrderFlightTripEntity[];
  @Input() ticket: OrderFlightTicketEntity;
  isShow = true;
  constructor(
    private calendarService: CalendarService,
    private popoverCtrl: PopoverController
  ) {}
  getIssueTime() {
    if (this.ticket) {
      const m = moment(this.ticket.IssueTime);
      const d = this.calendarService.generateDayModel(m);
      return `${m.format("YYYY年MM月DD日")}(${d.dayOfWeekName})`;
    }
  }

  async openRulesPopover(trip: OrderFlightTripEntity) {
    const p = await this.popoverCtrl.create({
      component: TripRulePopoverComponent,
      componentProps: {
        ticketRefundText: trip.RefundRule,
        ticketChangingText: trip.ChangeRule,
        ticketEndorsementText: trip.EiRule
      }
    });
    if (p) {
      p.present();
    }
  }

  getDate(dateTime: string) {
    if (!dateTime) {
      return "";
    }
    return moment(dateTime).format("YYYY年MM月DD日");
  }
  getHHmm(datetime) {
    if (!datetime) {
      return "";
    }
    return this.calendarService.getHHmm(datetime);
  }
  ngOnInit() {}
}
