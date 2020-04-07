import { TmcComponentsModule } from "./../tmc/components/tmcComponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HotelInternationalRoutingModule } from "./hotel-international-routing.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, HotelInternationalRoutingModule, TmcComponentsModule],
  exports: [HotelInternationalRoutingModule]
})
export class HotelInternationalModule {}
