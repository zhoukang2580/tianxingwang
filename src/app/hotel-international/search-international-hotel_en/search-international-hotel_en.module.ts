import { AppComponentsModule } from "./../../components/appcomponents.module";
import { TmcComponentsModule } from "./../../tmc/components/tmcComponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SearchInternationalHotelPageEnRoutingModule } from "./search-international-hotel_en-routing.module";

import { SearchInternationalHotelEnPage } from "./search-international-hotel_en.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchInternationalHotelPageEnRoutingModule,
    TmcComponentsModule,
    AppComponentsModule
  ],
  declarations: [SearchInternationalHotelEnPage]
})
export class SearchInternationalHotelEnPageModule {}
