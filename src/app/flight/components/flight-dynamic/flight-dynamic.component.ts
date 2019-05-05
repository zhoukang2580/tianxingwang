import { Component, OnInit, Input } from "@angular/core";
import { FlightSegmentModel } from "../../models/flight/FlightSegmentModel";

@Component({
  selector: "app-flight-dynamic",
  templateUrl: "./flight-dynamic.component.html",
  styleUrls: ["./flight-dynamic.component.scss"]
})
export class FlightDynamicComponent implements OnInit {
  @Input()
  fly: FlightSegmentModel;
  constructor() {}

  ngOnInit() {}
}
