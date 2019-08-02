import { OrderItemEntity } from 'src/app/order/models/OrderEntity';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-item-price-popover',
  templateUrl: './order-item-price-popover.component.html',
  styleUrls: ['./order-item-price-popover.component.scss'],
})
export class OrderItemPricePopoverComponent implements OnInit {
  orderItems:OrderItemEntity[];
  amount:number;
  constructor() { }

  ngOnInit() {}

}
