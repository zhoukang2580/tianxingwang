import { HotelInternationalComponentsModule } from "./../components/components.module";
import { AppDirectivesModule } from "./../../directives/directives.module";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InternationalHotelDetailPageRoutingModule } from "./international-hotel-detail-routing.module";

import { InternationalHotelDetailPage } from "./international-hotel-detail.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternationalHotelDetailPageRoutingModule,
    AppComponentsModule,
    AppDirectivesModule,
    HotelInternationalComponentsModule
  ],
  declarations: [InternationalHotelDetailPage]
})
export class InternationalHotelDetailPageModule {}
