import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";


import { OrderTrainDetailPage } from "./order-train-detail.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { OrderComponentsModule } from "../components/components.module";
import { TrainOrderDetailPageRoutingModule } from './order-train-detail_df-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainOrderDetailPageRoutingModule,
    AppComponentsModule,
    OrderComponentsModule
  ],
  declarations: [OrderTrainDetailPage]
})
export class OrderTrainDetailPageModule {}
