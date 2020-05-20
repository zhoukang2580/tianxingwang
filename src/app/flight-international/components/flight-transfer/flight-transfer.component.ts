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
  isShow=0;
  constructor() { }

  ngOnInit() { }
  isShowRemind(index, seg) {
    if (index && seg && this.flight) {
      if (this.flight.transferSegments[index - 1].ToAirportName!=seg.FromAirportName) {
        return this.isShow=1
      }else if((this.flight.transferSegments[index - 1].ToTerminal.includes("T")!=seg.FromTerminal)||(this.flight.transferSegments[index - 1].ToTerminal!=seg.FromTerminal.includes("T"))){
        return this.isShow=3
      }
      else if(this.flight.transferSegments[index - 1].ToTerminal!=seg.FromTerminal){
        return this.isShow=2
      }
      return this.isShow=3
    }
  }
}
