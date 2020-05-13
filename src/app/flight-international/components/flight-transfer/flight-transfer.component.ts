import { Component, OnInit } from "@angular/core";
import { FlightResultEntity } from "src/app/flight/models/FlightResultEntity";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import { PopoverController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { InternationalFlightService } from "../../international-flight.service";
import { finalize } from "rxjs/operators";
import { RefresherComponent } from "src/app/components/refresher";

@Component({
  selector: "app-flight-transfer",
  templateUrl: "./flight-transfer.component.html",
  styleUrls: ["./flight-transfer.component.scss"],
})
export class FlightTransferComponent implements OnInit {
  flight: FlightRouteEntity;
  private subscription = Subscription.EMPTY;
  constructor() { }

  ngOnInit() { }
  isShowRemind(index, seg) {
    if (index && seg && this.flight) {
      if (this.flight.transferSegments[index - 1].ToTerminal!=seg.FromTerminal) {
        return true
      }
      return false
    }
  }
}
