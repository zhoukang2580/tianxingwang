import { Component, OnInit, Input } from '@angular/core';
import { OrderModel } from "src/app/order/models/OrderModel";
import { OrderFlightTripStatusType } from 'src/app/order/models/OrderFlightTripStatusType';
@Component({
  selector: 'app-product-train',
  templateUrl: './product-train.component.html',
  styleUrls: ['./product-train.component.scss'],
})
export class ProductTrainComponent implements OnInit {
  @Input() orderModel: OrderModel;
  constructor() { }

  ngOnInit() {}

}
