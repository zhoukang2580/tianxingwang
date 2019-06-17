import { Component, OnInit, Input } from "@angular/core";
import { FlightSegmentEntity } from '../../models/flight/FlightSegmentEntity';

@Component({
  selector: "app-flight-dynamic",
  templateUrl: "./flight-dynamic.component.html",
  styleUrls: ["./flight-dynamic.component.scss"]
})
export class FlightDynamicComponent implements OnInit {
  @Input()
  fly: FlightSegmentEntity;
  constructor() {}

  ngOnInit() {}
}
