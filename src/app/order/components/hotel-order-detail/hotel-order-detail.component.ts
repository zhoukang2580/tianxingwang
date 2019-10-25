import { OrderEntity } from './../../models/OrderEntity';
import { Component, OnInit, Input } from '@angular/core';
import { OrderHotelEntity } from '../../models/OrderHotelEntity';
import { OrderItemHelper } from 'src/app/flight/models/flight/OrderItemHelper';
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: 'app-hotel-order-detail',
  templateUrl: './hotel-order-detail.component.html',
  styleUrls: ['./hotel-order-detail.component.scss'],
})
export class HotelOrderDetailComponent implements OnInit {
  @Input() hotels: OrderHotelEntity[];
  @Input() order: OrderEntity;
  constructor() { }

  ngOnInit() {
  }
  getHotelRoomFee(orderHotelKey: string) {
    return this.order
      && this.order.OrderItems
      && this.order.OrderItems
        .filter(it => it.Key == orderHotelKey && it.Tag == OrderItemHelper.Hotel)
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
  }
  getOrderNumbers() {
    if (this.order && this.order.OrderNumbers)
      return this.order.OrderNumbers.filter(it => it.Tag == "TmcOutNumber");
  }
  getVariable(orderHotel: OrderHotelEntity, key: string) {
    orderHotel.VariablesJsonObj = orderHotel.VariablesJsonObj || JSON.parse(orderHotel.Variables) || {};
    return orderHotel.VariablesJsonObj[key];
  }
  getHotelOrderTravel(orderHotel: OrderHotelEntity) {
    if (!orderHotel) {
      return;
    }
    orderHotel.OrderTravel = orderHotel.OrderTravel || (this.order && this.order.OrderTravels.find(it => it.Key == orderHotel.Key));
    return orderHotel.OrderTravel;
  }
}
