import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ModalController } from "@ionic/angular";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { CalendarService } from "src/app/tmc/calendar.service";
import { OrderInsuranceType } from "src/app/insurance/models/OrderInsuranceType";
import { OrderInsuranceStatusType } from "src/app/order/models/OrderInsuranceStatusType";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { OrderTravelPayType } from "src/app/order/models/OrderTravelEntity";
import { FlightTripComponent } from '../flight-trip/flight-trip.component';

@Component({
  selector: "app-flight-trip_en",
  templateUrl: "./flight-trip_en.component.html",
  styleUrls: ["./flight-trip_en.component.scss"],
})
export class FlightTripEnComponent extends FlightTripComponent {
 
}
