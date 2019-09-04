import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { HotelListPage } from "./hotel-list.page";
import { HotelComponentsModule } from "../components/components.module";

const routes: Routes = [
  {
    path: "",
    component: HotelListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HotelComponentsModule
  ],
  declarations: [HotelListPage]
})
export class HotelListPageModule {}
