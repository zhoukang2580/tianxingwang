import { environment } from "./../../../../environments/environment";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges
} from "@angular/core";
import { OrderTripTicketModel } from "../../order-detail/order-detail.page";
import { OrderItemEntity } from "src/app/order/models/OrderEntity";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { ModalController } from "@ionic/angular";
@Component({
  selector: "app-flight-trip",
  templateUrl: "./flight-trip.component.html",
  styleUrls: ["./flight-trip.component.scss"]
})
export class FlightTripComponent implements OnInit, OnChanges {
  @Input() tripAndTicket: OrderTripTicketModel;
  refundDeductionFee: number;
  exchangeFee: number;
  constructor() {}
  async ngOnChanges(change: SimpleChanges) {
    if (change && change.tripAndTicket && change.tripAndTicket.currentValue) {
      // console.log(JSON.stringify(this.tripAndTicket));
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
    }
  }

  ngOnInit() {}
}
