import { FlightSegmentEntity } from "src/app/flight/models/flight/FlightSegmentEntity";
import { Component, OnInit, Input } from "@angular/core";
import { FlightSegmentItemComponent } from '../flight-segment-item/flight-segment-item.component';

@Component({
  selector: "app-flight-segment-item-en",
  templateUrl: "./flight-segment-item-en.component.html",
  styleUrls: ["./flight-segment-item-en.component.scss"],
})
export class FlightSegmentItemEnComponent extends FlightSegmentItemComponent {

}
