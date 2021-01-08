import { HotelComponentsModule } from "../components/components.module";
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { AppComponentsModule } from "../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { HotelDetailDfPage } from "./hotel-detail-df.page";
import { SelectPassengerPage } from "src/app/tmc/select-passenger/select-passenger.page";

const routes: Routes = [
  {
    path: "",
    component: HotelDetailDfPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HotelComponentsModule,
    AppComponentsModule
  ],
  declarations: [HotelDetailDfPage]
})
export class HotelDetailDfPageModule {}
