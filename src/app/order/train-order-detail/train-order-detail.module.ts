import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TrainOrderDetailPageRoutingModule } from "./train-order-detail-routing.module";

import { TrainOrderDetailPage } from "./train-order-detail.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { OrderComponentsModule } from "../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainOrderDetailPageRoutingModule,
    AppComponentsModule,
    OrderComponentsModule
  ],
  declarations: [TrainOrderDetailPage]
})
export class TrainOrderDetailPageModule {}
