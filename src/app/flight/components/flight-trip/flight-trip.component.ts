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
@Component({
  selector: "app-flight-trip",
  templateUrl: "./flight-trip.component.html",
  styleUrls: ["./flight-trip.component.scss"]
})
export class FlightTripComponent implements OnInit, OnChanges {
  @Input() viewModel: ITicketViewModelItem;
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
    if (change && change.viewModel && change.viewModel.currentValue) {
      const orderItems = this.viewModel.orderItems || [];
      this.refundDeductionFee = orderItems
        .filter(it => it.Tag == OrderItemHelper.FlightTicketRefundDeduction)
        .reduce((acc, it) => (acc = AppHelper.mathAdd(acc, +it.CostAmount)), 0);
      this.exchangeFee = orderItems
        .filter(it => it.Tag == OrderItemHelper.FlightTicketExchange)
        .reduce((acc, it) => (acc = AppHelper.mathAdd(acc, +it.CostAmount)), 0);
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
    if (this.viewModel && this.viewModel.orderFlightTicket) {
      const ticket = (this.viewModel.orderFlightTickets || []).find(it => {
        if (!this.viewModel.orderFlightTicket.VariablesJsonObj) {
          this.viewModel.orderFlightTicket.VariablesJsonObj =
            (this.viewModel.orderFlightTicket.Variables &&
              JSON.parse(this.viewModel.orderFlightTicket.Variables)) ||
            {};
        }
        return (
          it.Id ==
          this.viewModel.orderFlightTicket.VariablesJsonObj["OriginalTicketId"]
        );
      });
      if (ticket) {
        this.originalTrips = ticket.OrderFlightTrips || [];
      } else {
        this.originalTrips =
          this.viewModel.orderFlightTicket.OrderFlightTrips || [];
      }
      const orderFlightTicket = this.viewModel.orderFlightTicket;
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
    if (
      this.viewModel &&
      this.viewModel.orderFlightTicket &&
      this.viewModel.orderFlightTicket.OrderFlightTrips
    ) {
      this.exchangedTrips = (
        this.viewModel.orderFlightTicket.OrderFlightTrips || []
      )
        .filter(it => it.Status == OrderFlightTripStatusType.Exchange)
        .map(it => {
          if (it.TakeoffTime) {
            const m = moment(it.TakeoffTime);
            const d = this.flydayService.generateDayModel(m);
            it.TakeoffDate = m.format(`YYYY年MM月DD日(${d.dayOfWeekName})`);
          }
          return it;
        });
    }
  }
  private initRefundTrips() {
    if (this.viewModel && this.viewModel.orderFlightTicket) {
      const orderFlightTicket = this.viewModel.orderFlightTicket;
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
