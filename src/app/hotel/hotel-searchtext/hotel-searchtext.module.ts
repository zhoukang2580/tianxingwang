import { AppComponentsModule } from "../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";
import { HotelSearchTextPageRoutingModule } from "./hotel-searchtext-routing.module";
import { HotelSearchTextPage } from "./hotel-searchtext.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HotelSearchTextPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [HotelSearchTextPage]
})
export class HotelSearchTextPageModule {}
