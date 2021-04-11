import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { HotelListPage } from "./hotel-list.page";
import { HotelComponentsModule } from "../components/components.module";
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: HotelListPage,
    canActivate:[StylePageGuard]
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
  declarations: [HotelListPage]
})
export class HotelListPageModule {}
