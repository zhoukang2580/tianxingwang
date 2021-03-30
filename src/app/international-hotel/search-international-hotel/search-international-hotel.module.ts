import { AppComponentsModule } from "../../components/appcomponents.module";
import { TmcComponentsModule } from "../../tmc/components/tmcComponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SearchInternationalHotelPageRoutingModule } from "./search-international-hotel-routing.module";

import { SearchInternationalHotelPage } from "./search-international-hotel.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchInternationalHotelPageRoutingModule,
    TmcComponentsModule,
    AppComponentsModule
  ],
  declarations: [SearchInternationalHotelPage]
})
export class SearchInternationalHotelPageModule {}
