import { TmcComponentsModule } from "../../tmc/components/tmcComponents.module";
import { AppComponentsModule } from "../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { FlightPipesModule } from "src/app/flight/pipes/Pipes.module";
import { OrderComponentsModule } from '../components/components.module';
import { FlightComponentsModule } from 'src/app/flight/components/components.module';

import { HotelOrderDetailDfPageRoutingModule } from './order-hotel-detail_df-routing.module';

import { OrderHotelDetailDfPage } from './order-hotel-detail_df.page';

const routes: Routes = [
  {
    path: "",
    component: OrderHotelDetailDfPage
  }
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HotelOrderDetailDfPageRoutingModule,
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
  declarations: [OrderHotelDetailDfPage]
})
export class OrderHotelDetailDfPageModule {}
