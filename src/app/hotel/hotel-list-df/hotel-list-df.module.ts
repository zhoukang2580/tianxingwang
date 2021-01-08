import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { HotelListDfPage } from "./hotel-list-df.page";
import { HotelComponentsModule } from "../components/components.module";

const routes: Routes = [
  {
    path: "",
    component: HotelListDfPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HotelComponentsModule,
    AppDirectivesModule,
    AppComponentsModule
  ],
  declarations: [HotelListDfPage]
})
export class HotelListDfPageModule {}
