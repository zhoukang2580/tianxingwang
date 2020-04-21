import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlightInternationalRoutingModule } from "./international-flight-routing.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, FlightInternationalRoutingModule],
  exports: [FlightInternationalRoutingModule]
})
export class FlightInternationalModule {}
