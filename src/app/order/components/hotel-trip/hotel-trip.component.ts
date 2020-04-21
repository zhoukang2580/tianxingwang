import { Component, OnInit, Input } from '@angular/core';
import { OrderTripModel } from 'src/app/order/models/OrderTripModel';

@Component({
  selector: 'app-hotel-trip',
  templateUrl: './hotel-trip.component.html',
  styleUrls: ['./hotel-trip.component.scss'],
})
export class HotelTripComponent implements OnInit {
  @Input() trip: OrderTripModel;
  constructor() { }

  ngOnInit() {}

}
