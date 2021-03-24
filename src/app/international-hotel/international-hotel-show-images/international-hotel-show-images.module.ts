import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InternationalHotelShowImagesPageRoutingModule } from "./international-hotel-show-images-routing.module";

import { InternationalHotelShowImagesPage } from "./international-hotel-show-images.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternationalHotelShowImagesPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [InternationalHotelShowImagesPage]
})
export class InternationalHotelShowImagesPageModule {}
