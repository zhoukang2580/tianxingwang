import { ActivatedRoute } from "@angular/router";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-flight-detail",
  templateUrl: "./flight-detail.page.html",
  styleUrls: ["./flight-detail.page.scss"]
})
export class FlightDetailPage implements OnInit {
  flightSegment: FlightSegmentEntity;
  constructor(private activatedRoute: ActivatedRoute) {
    activatedRoute.paramMap.subscribe(p => {
      if (p.get("flightSegment")) {
        this.flightSegment = JSON.parse(p.get("flightSegment"));
      }
    });
  }

  ngOnInit() {}
}
