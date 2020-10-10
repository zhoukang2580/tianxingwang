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

const routes: Routes = [
  {
    path: "",
    component: OrderFlightDetailEnPage,
    canActivate:[StylePageGuard]
  }
];

import { FlightOrderDetailEnPageRoutingModule } from './order-flight-detail_en-routing.module';

import { OrderFlightDetailEnPage } from './order-flight-detail_en.page';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightOrderDetailEnPageRoutingModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
    FlightPipesModule,
    OrderComponentsModule,
    TmcComponentsModule,
    FlightComponentsModule
  ],
  declarations: [OrderFlightDetailEnPage]
})
export class OrderFlightDetailEnPageModule {

}
