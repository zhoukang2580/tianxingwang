import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FlightRouteEntity } from 'src/app/flight/models/flight/FlightRouteEntity';

@Component({
  selector: 'app-flight-list-item',
  templateUrl: './flight-list-item.component.html',
  styleUrls: ['./flight-list-item.component.scss'],
})
export class FlightListItemComponent implements OnInit {
  @Input() flight: FlightRouteEntity;
  @Output()  transfer: EventEmitter<any>;
  constructor() {
    this.transfer = new EventEmitter();
  }
  onTransfer() {
    this.transfer.emit()
  }
  ngOnInit() { }

}
