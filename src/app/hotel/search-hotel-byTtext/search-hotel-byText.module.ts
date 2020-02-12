import { SearchByTextPageRoutingModule } from "./../../hotel-international/search-by-text/search-by-text-routing.module";
import { SearchHotelByTextPage } from "./search-hotel-byText.page";
import { AppComponentsModule } from "./../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchByTextPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [SearchHotelByTextPage]
})
export class SearchHotelByTextPageModule {}
