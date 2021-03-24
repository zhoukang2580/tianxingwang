import { HotelInternationalComponentsModule } from "../components/components.module";
import { AppDirectivesModule } from "../../directives/directives.module";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InternationalHotelDetailDfPageRoutingModule } from "./international-hotel-detail-df-routing.module";

import { InternationalHotelDetailDfPage } from "./international-hotel-detail-df.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternationalHotelDetailDfPageRoutingModule,
    AppComponentsModule,
    AppDirectivesModule,
    HotelInternationalComponentsModule
  ],
  declarations: [InternationalHotelDetailDfPage]
})
export class InternationalHotelDetailDfPageModule {}
