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

}
