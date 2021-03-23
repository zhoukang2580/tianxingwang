import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { FlightListPageEnRoutingModule } from "./flight-list_en-routing.module";

import { FlightListEnPage } from "./flight-list_en.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { InternationalFlightComponentsModule } from "../components/international-flight.components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightListPageEnRoutingModule,
    AppComponentsModule,
    InternationalFlightComponentsModule
  ],
  declarations: [FlightListEnPage]
})
export class FlightListEnPageModule {}
