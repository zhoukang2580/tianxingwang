import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarRoutingModule } from "./car-routing.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, CarRoutingModule],
  exports: [CarRoutingModule]
})
export class CarModule {}
