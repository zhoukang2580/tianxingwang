import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RoutingModule } from "./routing.module";
import { FlightPipesModule } from "../flight/pipes/Pipes.module";
import { TmcComponentsModule } from '../tmc/components/tmcComponents.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RoutingModule,
    FlightPipesModule,
    TmcComponentsModule
  ],
  exports: [RoutingModule]
})
export class OrderModule {}
