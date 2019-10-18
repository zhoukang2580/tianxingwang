import { OrderTripModel } from './../../models/OrderTripModel';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-order-trip-item',
  templateUrl: './order-trip-item.component.html',
  styleUrls: ['./order-trip-item.component.scss'],
})
export class OrderTripItemComponent implements OnInit {
  @Input() trip: OrderTripModel;
  constructor() { }

  ngOnInit() { }

}
