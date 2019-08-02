import { TmcComponentsModule } from "./../components/tmcComponents.module";
import { AppComponentsModule } from "./../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { OrderDetailPage } from "./order-detail.page";
import { FlightPipesModule } from "src/app/flight/pipes/Pipes.module";

const routes: Routes = [
  {
    path: "",
    component: OrderDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
    FlightPipesModule,
    TmcComponentsModule
  ],
  declarations: [OrderDetailPage]
})
export class OrderDetailPageModule {}
