import { Component, OnInit } from "@angular/core";
import { FlightFareEntity } from "src/app/flight/models/FlightFareEntity";

@Component({
  selector: "app-refund-change-detail",
  templateUrl: "./refund-change-detail.component.html",
  styleUrls: ["./refund-change-detail.component.scss"],
})
export class RefundChangeDetailComponent implements OnInit {
  flightfares: FlightFareEntity[];
  get explain() {
    return (
      (this.flightfares &&
        this.flightfares[0] &&
        this.flightfares[0].Explain &&
        this.flightfares[0].Explain.replace(/\r/g, "<br/>")) ||
      ""
    );
  }
  constructor() {}

  ngOnInit() {}
  getBags(bags) {
    if (!bags) {
      return [];
    }
    let bginfo = "";
    return Object.keys(bags).map((it) => bags[it]);
  }
}
