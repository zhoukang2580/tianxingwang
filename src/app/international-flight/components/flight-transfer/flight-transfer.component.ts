import { Component, OnInit } from "@angular/core";
import { FlightResultEntity } from "src/app/flight/models/FlightResultEntity";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import { PopoverController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { InternationalFlightService } from "../../international-flight.service";
import { finalize } from "rxjs/operators";
import { RefresherComponent } from "src/app/components/refresher";
import { FlightSegmentEntity } from "src/app/flight/models/flight/FlightSegmentEntity";

@Component({
  selector: "app-flight-transfer",
  templateUrl: "./flight-transfer.component.html",
  styleUrls: ["./flight-transfer.component.scss"],
})
export class FlightTransferComponent implements OnInit {
  flight: FlightRouteEntity;
  private subscription = Subscription.EMPTY;
  constructor(
    private popCtrl: PopoverController,
    private flightService: InternationalFlightService
  ) {}
  onDismiss() {
    this.popCtrl.getTop().then((t) => {
      t.dismiss();
    });
  }
  ngOnInit() {
    if (
      this.flight &&
      this.flight.transferSegments &&
      this.flight.transferSegments.length
    ) {
      this.flight.transferSegments.forEach((seg, idx) => {
        if (idx > 0) {
          const last = this.flight.transferSegments[idx - 1];
          if (last) {
            if (seg.FromAirportName != last.ToAirportName) {
              seg["showRemind"] = 1;
            } else {
              if (
                seg.FromTerminal.replace("T", "") !=
                last.ToTerminal.replace("T", "")
              ) {
                seg["showRemind"] = 2;
              }
            }
          }
        }
      });
    }
  }
  async onGetStopCities(seg: FlightSegmentEntity) {
    try {
      if (seg.StopCities && seg.StopCities.length) {
        return;
      }
      const r = await this.flightService.getStopCities(
        this.flight.transferSegments
      );
      seg.StopCities = r.FlightStopCities;
    } catch (e) {
      console.error(e);
    }
  }
}
