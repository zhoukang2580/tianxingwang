import { AppComponentsModule } from './components/components.module';
import { NgModule } from "@angular/core";
import { FlightRoutingModule } from './flight.routing.module';
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [],
  imports: [CommonModule, AppComponentsModule, FlightRoutingModule],
  exports: [AppComponentsModule]
})
export class FlightModule { }
