import { HotelInternationalComponentsModule } from "../components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InternationalHotelBookinfosPageRoutingModule } from "./international-hotel-bookinfos-routing_en.module";

import { InternationalHotelBookinfosEnPage } from "./international-hotel-bookinfos_en.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternationalHotelBookinfosPageRoutingModule,
    HotelInternationalComponentsModule
  ],
  declarations: [InternationalHotelBookinfosEnPage]
})
export class InternationalHotelBookinfosEnPageModule {}
