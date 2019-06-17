import { ComponentsModule } from './components/components.module';
import { NgModule } from "@angular/core";
import { FlightRoutingModule } from './flight.routing.module';
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [],
  imports: [CommonModule, ComponentsModule, FlightRoutingModule],
  exports: [ComponentsModule]
})
export class FlightModule { }
