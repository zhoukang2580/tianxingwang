import { HotelInternationalComponentsModule } from "./../components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InternationalHotelBookinfosPageRoutingModule } from "./international-hotel-bookinfos-routing.module";

import { InternationalHotelBookinfosPage } from "./international-hotel-bookinfos.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternationalHotelBookinfosPageRoutingModule,
    HotelInternationalComponentsModule
  ],
  declarations: [InternationalHotelBookinfosPage]
})
export class InternationalHotelBookinfosPageModule {}
