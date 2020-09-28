import { CalendarService } from '../../../tmc/calendar.service';
import { Component, OnInit, Input } from '@angular/core';
import { OrderTripModel } from 'src/app/order/models/OrderTripModel';
import { OrderInsuranceType } from 'src/app/insurance/models/OrderInsuranceType';
import { TrainTripComponent } from '../train-trip/train-trip.component';

@Component({
  selector: 'app-train-trip_en',
  templateUrl: './train-trip_en.component.html',
  styleUrls: ['./train-trip_en.component.scss'],
})
export class TrainTripEnComponent extends TrainTripComponent {
 
}
