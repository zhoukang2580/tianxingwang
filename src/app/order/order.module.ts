import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RoutingModule } from "./routing.module";
import { FlightPipesModule } from "../flight/pipes/Pipes.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RoutingModule,
    FlightPipesModule
  ],
  exports: [RoutingModule]
})
export class OrderModule {}
