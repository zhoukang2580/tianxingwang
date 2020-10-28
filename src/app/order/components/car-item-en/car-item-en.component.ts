import { OrderCardEntity } from '../../models/OrderCardEntity';
import { OrderModel } from '../../models/OrderModel';
import { Component, OnInit, Input } from '@angular/core';
import { OrderEntity } from '../../models/OrderEntity';
import { OrderPassengerEntity } from '../../models/OrderPassengerEntity';
import { CarItemComponent } from '../car-item/car-item.component';

@Component({
  selector: 'app-car-item-en',
  templateUrl: './car-item-en.component.html',
  styleUrls: ['./car-item-en.component.scss'],
})
export class CarItemEnComponent extends CarItemComponent{}
