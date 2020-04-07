import { FlightSegmentEntity } from "src/app/flight/models/flight/FlightSegmentEntity";
import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-flight-segment-item",
  templateUrl: "./flight-segment-item.component.html",
  styleUrls: ["./flight-segment-item.component.scss"]
})
export class FlightSegmentItemComponent implements OnInit {
  @Input() segment: FlightSegmentEntity;
  @Input() isHasFiltered: boolean;
  @Input() isRecomendSegment: boolean;
  constructor() {}

  ngOnInit() {}
}
