import { OrderCardEntity } from './../../models/OrderCardEntity';
import { OrderModel } from './../../models/OrderModel';
import { Component, OnInit, Input } from '@angular/core';
import { OrderEntity } from '../../models/OrderEntity';
import { OrderPassengerEntity } from '../../models/OrderPassengerEntity';

@Component({
  selector: 'app-car-item',
  templateUrl: './car-item.component.html',
  styleUrls: ['./car-item.component.scss'],
})
export class CarItemComponent implements OnInit {
  @Input() order: OrderEntity;
  itemname:string;
  constructor() { }

  ngOnInit() { 
    this.order.OrderCars= this.order.OrderCars.map(my=>{
      my.Passenger=this.getPassengerName(my)
      return my
    })
  }
  getPassengerName(ticket: { Passenger: OrderPassengerEntity }) {
    const p = (this.order && this.order.OrderPassengers) || [];
    return p.find(it => it.Id == (ticket.Passenger && ticket.Passenger.Id));
  }


}
