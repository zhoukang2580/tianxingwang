import { AppComponentsModule } from "./../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";
import { ComboxSearchHotelPage } from "./combox-search-hotel.page";
import { ComboxSearchHotelPageRoutingModule } from "./combox-search-hotel-routing.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComboxSearchHotelPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [ComboxSearchHotelPage]
})
export class ComboxSearchHotelPageModule {}
