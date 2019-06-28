import { FlightService } from "src/app/flight/flight.service";
import { NgModule } from "@angular/core";
import { FlightRoutingModule } from "./flight.routing.module";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [],
  imports: [CommonModule, FlightRoutingModule],
  exports: [FlightRoutingModule]
})
export class FlightModule {
  constructor(private flightService: FlightService) {}
}
