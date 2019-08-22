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
import { OrderItemEntity } from "src/app/order/models/OrderEntity";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { ModalController, PopoverController } from "@ionic/angular";
import { TripRulePopoverComponent } from "../../../order/components/trip-rule-popover/trip-rule-popover.component";
import { OrderFlightTicketEntity } from "src/app/order/models/OrderFlightTicketEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
import * as moment from "moment";
@Component({
  selector: "app-flight-trip",
  templateUrl: "./flight-trip.component.html",
  styleUrls: ["./flight-trip.component.scss"]
})
export class FlightTripComponent implements OnInit, OnChanges {
  @Input() tripAndTicket: any;
  refundDeductionFee: number;
  exchangeFee: number;
  originalTrips: OrderFlightTripEntity[]; // 原始航班信息
  exchangedTrips: OrderFlightTripEntity[]; // 改签航班信息
  refundTrips: OrderFlightTripEntity[]; // 退票航班信息
  constructor(
    private popoverCtrl: PopoverController,
    private flydayService: CalendarService
  ) {}
  async ngOnChanges(change: SimpleChanges) {
    if (change && change.tripAndTicket && change.tripAndTicket.currentValue) {
      console.log(this.tripAndTicket.trip);
      if (this.tripAndTicket.order && this.tripAndTicket.order.OrderItems) {
        const orderItems = this.tripAndTicket.order.OrderItems.filter(
          it => it.Key == this.tripAndTicket.ticket.Key
        );
        this.refundDeductionFee = orderItems
          .filter(it => it.Tag == OrderItemHelper.FlightTicketRefundDeduction)
          .reduce((acc, it) => (acc += +it.CostAmount), 0);
        this.exchangeFee = orderItems
          .filter(it => it.Tag == OrderItemHelper.FlightTicketExchange)
          .reduce((acc, it) => (acc += +it.CostAmount), 0);
      }
      this.initOriginalTrips();
      this.initExchangedTrips();
      this.initRefundTrips();
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
  private initOriginalTrips() {
    if (this.tripAndTicket) {
      const ticket = this.tripAndTicket.order.OrderFlightTickets.find(
        it =>
          it.Id ==
          this.tripAndTicket.ticket.VariablesJsonObj["OriginalTicketId"]
      );
      if (ticket) {
        this.originalTrips = ticket.OrderFlightTrips || [];
      } else {
        this.originalTrips = this.tripAndTicket.ticket.OrderFlightTrips || [];
      }
      const orderFlightTicket = this.tripAndTicket.ticket;
      this.originalTrips = this.originalTrips
        .filter(
          it =>
            this.getTimeStamp(it.InsertTime) <
              this.getTimeStamp(orderFlightTicket.IssueTime) ||
            this.getTimeStamp(orderFlightTicket.IssueTime) <=
              +moment("1800-01-01T00:00:00")
        )
        .map(it => {
          if (it.TakeoffTime) {
            const m = moment(it.TakeoffTime);
            const d = this.flydayService.generateDayModel(m);
            it.TakeoffDate = m.format(`YYYY年MM月DD日(${d.dayOfWeekName})`);
          }
          return it;
        });
      this.originalTrips.sort((a, b) => +a.Id - +b.Id);
    }
  }
  private getTimeStamp(t: any) {
    return +moment(t);
  }
  private getDateTime(t: any, year = "-", month = "-", day = "") {
    return moment(t).format(`YYYY${year}MM${month}DD${day} HH:mm`);
  }
  private initExchangedTrips() {
    if (this.tripAndTicket&&this.tripAndTicket.ticket.VariablesJsonObj['OriginalTicketId']) {
      const orderFlight = this.tripAndTicket.ticket;
      const one = (this.tripAndTicket.order.OrderFlightTickets || []).find(
        it => it.Id == orderFlight.Id
      );
      if (one) {
        this.exchangedTrips = (one.OrderFlightTrips || []).map(it => {
          if (it.TakeoffTime) {
            const m = moment(it.TakeoffTime);
            const d = this.flydayService.generateDayModel(m);
            it.TakeoffDate = m.format(`YYYY年MM月DD日(${d.dayOfWeekName})`);
          }
          return it;
        });
      }
    }
  }
  private initRefundTrips() {
    if (this.tripAndTicket) {
      const orderFlightTicket = this.tripAndTicket.ticket;
      if (orderFlightTicket && orderFlightTicket.OrderFlightTrips) {
        this.refundTrips = orderFlightTicket.OrderFlightTrips.filter(
          orderFlightTrip =>
            orderFlightTrip.Status == OrderFlightTripStatusType.Refund
        ).map(it => {
          if (it.TakeoffTime) {
            const m = moment(it.TakeoffTime);
            const d = this.flydayService.generateDayModel(m);
            it.TakeoffDate = m.format(`YYYY年MM月DD日(${d.dayOfWeekName})`);
          }
          return it;
        });
      }
    }
  }
  ngOnInit() {}
}
