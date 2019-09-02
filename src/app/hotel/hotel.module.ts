import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HotelRoutingModule } from "./hotel-routing.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, HotelRoutingModule],
  exports: [HotelRoutingModule]
})
export class HotelModule {}
