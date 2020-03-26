import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SearchInternationalFlightPageRoutingModule } from "./search-international-flight-routing.module";

import { SearchInternationalFlightPage } from "./search-international-flight.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { InternationalFlightComponentsModule } from "../components/international-flight.components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchInternationalFlightPageRoutingModule,
    AppComponentsModule,
    InternationalFlightComponentsModule
  ],
  declarations: [SearchInternationalFlightPage]
})
export class SearchInternationalFlightPageModule {}
