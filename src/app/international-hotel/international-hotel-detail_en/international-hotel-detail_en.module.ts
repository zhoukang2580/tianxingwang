import { HotelInternationalComponentsModule } from "../components/components.module";
import { AppDirectivesModule } from "../../directives/directives.module";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InternationalHotelDetailEnPageRoutingModule } from "./international-hotel-detail_en-routing.module";

import { InternationalHotelDetailEnPage } from "./international-hotel-detail_en.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternationalHotelDetailEnPageRoutingModule,
    AppComponentsModule,
    AppDirectivesModule,
    HotelInternationalComponentsModule
  ],
  declarations: [InternationalHotelDetailEnPage]
})
export class InternationalHotelDetailEnPageModule {}
