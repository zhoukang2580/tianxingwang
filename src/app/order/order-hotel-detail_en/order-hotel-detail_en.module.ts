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

import { HotelOrderDetailPageRoutingModule } from './order-hotel-detail_en-routing.module';

import { OrderHotelDetailEnPage } from './order-hotel-detail_en.page';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: OrderHotelDetailEnPage,
    canActivate: [StylePageGuard],
  }
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HotelOrderDetailPageRoutingModule,
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
  declarations: [OrderHotelDetailEnPage]
})
export class OrderHotelDetailEnPageModule {}
