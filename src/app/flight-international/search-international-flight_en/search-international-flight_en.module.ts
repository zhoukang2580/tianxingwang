import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SearchInternationalFlightEnPageRoutingModule } from "./search-international-flight_en-routing.module";

import { SearchInternationalFlightEnPage } from "./search-international-flight_en.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { InternationalFlightComponentsModule } from "../components/international-flight.components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchInternationalFlightEnPageRoutingModule,
    AppComponentsModule,
    InternationalFlightComponentsModule
  ],
  declarations: [SearchInternationalFlightEnPage],
})
export class SearchInternationalFlightEnPageModule {}
