import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InterHotelMapPageRoutingModule } from "./inter-hotel-map-routing.module";

import { InterHotelMapPage } from "./inter-hotel-map.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { HotelInternationalComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterHotelMapPageRoutingModule,
    AppComponentsModule,
    HotelInternationalComponentsModule
  ],
  declarations: [InterHotelMapPage],
})
export class InterHotelMapPageModule {}
