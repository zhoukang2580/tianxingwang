import { OrderFlightTicketEntity } from "../../../order/models/OrderFlightTicketEntity";
import { PopoverController } from "@ionic/angular";
import { OrderFlightTripEntity } from "../../../order/models/OrderFlightTripEntity";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import * as moment from "moment";
import { TripRulePopoverComponent } from "../../../order/components/trip-rule-popover/trip-rule-popover.component";
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";

@Component({
  selector: "app-original-flight-trip",
  templateUrl: "./original-flight-trip.component.html",
  styleUrls: ["./original-flight-trip.component.scss"]
})
export class OriginalFlightTripComponent implements OnInit, OnChanges {
  @Input() trip: OrderFlightTripEntity;
  @Input() tripDesc: string;
  @Input() ticket: OrderFlightTicketEntity;
  @Input() exchangeFee: string;
  @Input() refundDeductionFee: string;
  showHide = false;
  OrderFlightTicketStatusType = OrderFlightTicketStatusType;
  ticketIssueDateTime: string;
  takeOffDateTime: string;
  constructor(private popoverCtrl: PopoverController) {}

  onShowHide() {
    this.showHide = !this.showHide;
  }
  ngOnInit() {}
  ngOnChanges(change: SimpleChanges) {
    if (change && change.ticket && change.ticket.currentValue) {
      if (!this.ticket.IssueTime.startsWith("1800")) {
        this.ticketIssueDateTime = moment(this.ticket.IssueTime).format(
          "YYYY年MM月DD日 HH:mm"
        );
      }
    }
    if (change && change.trip && change.trip.currentValue) {
      this.takeOffDateTime = moment(this.trip.TakeoffTime).format(
        "YYYY年MM月DD日 HH:mm"
      );
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
}
