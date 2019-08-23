import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { Component, OnInit, Input } from "@angular/core";
import { ITicketViewModelItem } from "src/app/order/order-detail/order-detail.page";
import * as moment from "moment";
@Component({
  selector: "app-flight-order-detial",
  templateUrl: "./flight-order-detial.component.html",
  styleUrls: ["./flight-order-detial.component.scss"]
})
export class FlightOrderDetialComponent implements OnInit {
  @Input() viewModel: ITicketViewModelItem;
  OrderFlightTicketStatusType = OrderFlightTicketStatusType;
  constructor() {}
  ngOnInit() {}
}
