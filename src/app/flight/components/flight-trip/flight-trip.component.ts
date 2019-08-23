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
  @Input() viewModel: ITicketViewModelItem;
  refundDeductionFee: number;
  exchangeFee: number;
  trips: OrderFlightTripEntity[]; // 原始航班信息
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
      // this.initOriginalTrips();
      // this.initExchangedTrips();
      // this.initRefundTrips();
      this.initTrips();
    }
  }
  private initTrips() {
    if (
      this.viewModel &&
      this.viewModel.orderFlightTicket &&
      this.viewModel.orderFlightTicket.OrderFlightTrips
    ) {
      this.trips = this.viewModel.orderFlightTicket.OrderFlightTrips || [];
      this.trips.concat(this.getOriginalTrips());
    }
  }
  getTripDesc() {
    if (this.viewModel && this.viewModel.orderFlightTicket) {
      if (this.viewModel.orderFlightTicket.StatusName) {
        return `${this.viewModel.orderFlightTicket.StatusName}航班信息`;
      }
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
  private getOriginalTrips() {
    let originalTrips: OrderFlightTripEntity[] = [];
    if (
      this.viewModel &&
      this.viewModel.orderFlightTicket &&
      this.viewModel.order
    ) {
      if (!this.viewModel.orderFlightTicket.VariablesJsonObj) {
        this.viewModel.orderFlightTicket.VariablesJsonObj =
          (this.viewModel.orderFlightTicket.Variables &&
            JSON.parse(this.viewModel.orderFlightTicket.Variables)) ||
          {};
      }
      const originalTicketId = this.viewModel.orderFlightTicket
        .VariablesJsonObj["OriginalTicketId"];
      const ticket = this.viewModel.order.OrderFlightTickets.find(it => {
        return it.Id == originalTicketId;
      });
      originalTrips = (ticket && ticket.OrderFlightTrips) || [];
      console.log("原始航班", ticket, originalTrips);
      originalTrips = originalTrips.map(it => {
        if (it.TakeoffTime) {
          const m = moment(it.TakeoffTime);
          const d = this.flydayService.generateDayModel(m);
          it.TakeoffDate = m.format(`YYYY年MM月DD日(${d.dayOfWeekName})`);
        }
        return it;
      });
      originalTrips.sort((a, b) => +a.Id - +b.Id);
    }
    return originalTrips;
  }
  private getTimeStamp(t: any) {
    return +moment(t);
  }
  private getDateTime(t: any, year = "-", month = "-", day = "") {
    return moment(t).format(`YYYY${year}MM${month}DD${day} HH:mm`);
  }
  private getExchangedTrips() {
    let exchangedTrips: OrderFlightTripEntity[] = [];
    if (
      this.viewModel &&
      this.viewModel.orderFlightTicket &&
      this.viewModel.orderFlightTicket.OrderFlightTrips
    ) {
      exchangedTrips = (this.viewModel.orderFlightTicket.OrderFlightTrips || [])
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
    return exchangedTrips;
  }
  private getRefundTrips() {
    let refundTrips: OrderFlightTripEntity[] = [];
    if (this.viewModel && this.viewModel.orderFlightTicket) {
      const orderFlightTicket = this.viewModel.orderFlightTicket;
      if (orderFlightTicket && orderFlightTicket.OrderFlightTrips) {
        refundTrips = orderFlightTicket.OrderFlightTrips.filter(
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
    return refundTrips;
  }
  ngOnInit() {}
}
