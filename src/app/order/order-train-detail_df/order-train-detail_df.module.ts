import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";


import { OrderTrainDetailDfPage } from "./order-train-detail_df.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { OrderComponentsModule } from "../components/components.module";
import { TrainOrderDetailDfPageRoutingModule } from './order-train-detail_df-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainOrderDetailDfPageRoutingModule,
    AppComponentsModule,
    OrderComponentsModule
  ],
  declarations: [OrderTrainDetailDfPage]
})
export class OrderTrainDetailDfPageModule {}
