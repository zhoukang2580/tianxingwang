import { TmcComponentsModule } from "../../tmc/components/tmcComponents.module";
import { AppComponentsModule } from "../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { OrderDetailPage } from "./order-detail.page";
import { FlightPipesModule } from "src/app/flight/pipes/Pipes.module";
import { OrderComponentsModule } from '../components/components.module';
import { FlightComponentsModule } from 'src/app/flight/components/components.module';

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
    OrderComponentsModule,
    TmcComponentsModule,
    FlightComponentsModule
  ],
  declarations: [OrderDetailPage]
})
export class OrderDetailPageModule {}
