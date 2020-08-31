import { OrderEntity } from "../../models/OrderEntity";
import { Component, OnInit, Input } from "@angular/core";
import { OrderTrainTicketEntity } from "src/app/order/models/OrderTrainTicketEntity";
import { OrderTrainTicketStatusType } from "src/app/order/models/OrderTrainTicketStatusType";

@Component({
  selector: "app-train-order-detail",
  templateUrl: "./train-order-detail.component.html",
  styleUrls: ["./train-order-detail.component.scss"],
})
export class TrainOrderDetailComponent implements OnInit {
  @Input() trainTickets: OrderTrainTicketEntity[];
  @Input() order: OrderEntity;
  @Input() passengerId: string;
  OrderTrainTicketStatusType = OrderTrainTicketStatusType;
  constructor() {}

  ngOnInit() {}
  getCurrentPassengerTicket() {
    if (!this.passengerId) {
      return this.trainTickets;
    }
    return (
      this.trainTickets &&
      this.trainTickets.filter(
        (it) => it.Passenger && it.Passenger.Id == this.passengerId
      )
    );
  }
}
