import { ITicketViewModelItem } from "./../../../order/order-detail/order-detail.page";
import { CalendarService } from "../../../tmc/calendar.service";
import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";
import { environment } from "../../../../environments/environment";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges
} from "@angular/core";
import { OrderItemEntity, OrderEntity } from "src/app/order/models/OrderEntity";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { ModalController, PopoverController } from "@ionic/angular";
import { TripRulePopoverComponent } from "../../../order/components/trip-rule-popover/trip-rule-popover.component";
import { OrderFlightTicketEntity } from "src/app/order/models/OrderFlightTicketEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
import * as moment from "moment";
import { AppHelper } from "src/app/appHelper";
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
@Component({
  selector: "app-flight-trip",
  templateUrl: "./flight-trip.component.html",
  styleUrls: ["./flight-trip.component.scss"]
})
export class FlightTripComponent implements OnInit, OnChanges {
  @Input() trip: OrderFlightTripEntity;
  @Input() ticket: OrderFlightTicketEntity;
  @Input() tickets: OrderFlightTicketEntity[];
  @Input() type: "book" | "exchange" | "refund" | "issue";
  @Input() orderItems: OrderItemEntity[];
  @Input() trips: OrderFlightTripEntity[];
  refundDeductionFee: number;
  exchangeFee: number;
  originalTrips: OrderFlightTripEntity[];
  constructor(private popoverCtrl: PopoverController) {}
  getTripDateTime(trip: OrderFlightTripEntity) {
    if (!trip) {
      return null;
    }
    const takeOffDateTime = moment(trip.TakeoffTime).format(
      "YYYY年MM月DD日 HH:mm"
    );
    const arrivalDateTime = moment(trip.ArrivalTime).format(
      "YYYY年MM月DD日 HH:mm"
    );
    return {
      takeOffDateTime,
      arrivalDateTime
    };
  }
  getHHmm(datetime: string) {
    if (!datetime) {
      return null;
    }
    return moment(datetime).format("HH:mm");
  }
  getTicketIssueDateTime() {
    if (!this.ticket.IssueTime.startsWith("1800")) {
      return moment(this.ticket.IssueTime).format("YYYY年MM月DD日 HH:mm");
    }
    return "";
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

  private getTimeStamp(t: any) {
    return +moment(t);
  }
  private getDateTime(t: any, year = "-", month = "-", day = "") {
    return moment(t).format(`YYYY${year}MM${month}DD${day} HH:mm`);
  }
  async ngOnChanges(change: SimpleChanges) {
    if (change && change.orderItems && change.orderItems.currentValue) {
      const orderItems = this.orderItems || [];
      this.refundDeductionFee = orderItems
        .filter(it => it.Tag == OrderItemHelper.FlightTicketRefundDeduction)
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
      this.exchangeFee = orderItems
        .filter(
          it =>
            it.Tag == OrderItemHelper.FlightTicketExchangeApiFee ||
            it.Tag == OrderItemHelper.FlightTicketExchangeOfflineFee ||
            it.Tag == OrderItemHelper.FlightTicketExchangeOnlineFee
        )
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
    if (change && change.tickets && change.tickets.currentValue) {
      if (this.ticket) {
        if (!this.ticket.VariablesJsonObj) {
          this.ticket.VariablesJsonObj =
            (this.ticket.Variables && JSON.parse(this.ticket.Variables)) || {};
        }
      }
      const originalTicketId =
        this.ticket && this.ticket.VariablesJsonObj["OriginalTicketId"];
      const one = this.tickets.find(it => {
        return it.Id == originalTicketId;
      });
      this.originalTrips = (one && one.OrderFlightTrips) || [];
    }
  }
  private getAmount(
    args: OrderItemHelper | [OrderItemHelper],
    amountFromVariable?: string
  ) {
    if (!args || !this.orderItems) {
      return 0;
    }
    const tags = args instanceof Array ? args : [args];
    return this.orderItems
      .filter(it => tags.some(t => t == it.Tag))
      .reduce((acc, item) => {
        if (amountFromVariable) {
          item.VariablesJsonObj =
            item.VariablesJsonObj || JSON.parse(item.Variables) || {};
          acc += +item.VariablesJsonObj[amountFromVariable] || 0;
        } else {
          acc += +item.Amount || 0;
        }
        return acc;
      }, 0);
  }
  ngOnInit() {}
}
