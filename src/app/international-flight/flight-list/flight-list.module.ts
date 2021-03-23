import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { FlightListPageRoutingModule } from "./flight-list-routing.module";

import { FlightListPage } from "./flight-list.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { InternationalFlightComponentsModule } from "../components/international-flight.components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightListPageRoutingModule,
    AppComponentsModule,
    InternationalFlightComponentsModule
  ],
  declarations: [FlightListPage]
})
export class FlightListPageModule {}
