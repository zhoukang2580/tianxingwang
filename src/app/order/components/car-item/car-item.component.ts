import { OrderCardEntity } from './../../models/OrderCardEntity';
import { OrderModel } from './../../models/OrderModel';
import { Component, OnInit, Input } from '@angular/core';
import { OrderEntity } from '../../models/OrderEntity';

@Component({
  selector: 'app-car-item',
  templateUrl: './car-item.component.html',
  styleUrls: ['./car-item.component.scss'],
})
export class CarItemComponent implements OnInit {
  @Input() order: OrderEntity;
  constructor() { }

  ngOnInit() { 
  }


}
