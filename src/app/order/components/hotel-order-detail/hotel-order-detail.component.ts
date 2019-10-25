import { OrderEntity } from './../../models/OrderEntity';
import { Component, OnInit, Input } from '@angular/core';
import { OrderHotelEntity } from '../../models/OrderHotelEntity';

@Component({
  selector: 'app-hotel-order-detail',
  templateUrl: './hotel-order-detail.component.html',
  styleUrls: ['./hotel-order-detail.component.scss'],
})
export class HotelOrderDetailComponent implements OnInit {
  @Input() hotels: OrderHotelEntity[];
  @Input() order: OrderEntity;
  constructor() { }

  ngOnInit() { }
  getHotelRoomFee() {
    const items = this.order
      && this.order.OrderItems
      && this.order.OrderItems.filter(it => it.Tag == "Hotel");
    if (items.length > 1) {
      return items.map(h => ` 1 x ${h.Amount}`).join(",");
    }
    return items.map(it => it.Amount);
    // .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
  }
}
