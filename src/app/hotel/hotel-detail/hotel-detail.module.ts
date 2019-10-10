import { HotelComponentsModule } from "./../components/components.module";
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { AppComponentsModule } from "./../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { HotelDetailPage } from "./hotel-detail.page";
import { SelectPassengerPage } from "src/app/tmc/select-passenger/select-passenger.page";

const routes: Routes = [
  {
    path: "",
    component: HotelDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
    HotelComponentsModule,
    AppDirectivesModule
  ],
  declarations: [HotelDetailPage]
})
export class HotelDetailPageModule {}
