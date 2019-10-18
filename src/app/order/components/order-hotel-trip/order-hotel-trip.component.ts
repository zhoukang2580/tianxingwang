import { OrderTripModel } from './../../models/OrderTripModel';
import { AppHelper } from 'src/app/appHelper';
import { TmcEntity } from './../../../tmc/tmc.service';
import { TmcService } from 'src/app/tmc/tmc.service';
import { Component, OnInit, Input } from "@angular/core";
import { OrderHotelEntity, OrderHotelStatusType } from '../../models/OrderHotelEntity';
import { HotelPaymentType } from 'src/app/hotel/models/HotelPaymentType';
import { OrderEntity } from '../../models/OrderEntity';

@Component({
  selector: "app-order-hotel-trip",
  templateUrl: "./order-hotel-trip.component.html",
  styleUrls: ["./order-hotel-trip.component.scss"]
})
export class OrderHotelTripComponent implements OnInit {
  @Input() trip: OrderTripModel;
  @Input() order: OrderEntity;
  OrderHotelStatusType = OrderHotelStatusType;
  HotelPaymentType = HotelPaymentType;
  constructor() { }

  async ngOnInit() {
  }
}
