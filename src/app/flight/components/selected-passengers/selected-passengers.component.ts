import { Component, OnInit } from '@angular/core';
import { Staff } from '../../select-passenger/select-passenger.page';

@Component({
  selector: 'app-selected-passengers',
  templateUrl: './selected-passengers.component.html',
  styleUrls: ['./selected-passengers.component.scss'],
})
export class SelectedPassengersComponent implements OnInit {
  passengers:Staff[];
  constructor() { }

  ngOnInit() {}

}
