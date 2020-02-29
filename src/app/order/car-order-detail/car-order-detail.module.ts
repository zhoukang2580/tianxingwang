import { OrderComponentsModule } from './../components/components.module';
import { AppComponentsModule } from './../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarOrderDetailPageRoutingModule } from './car-order-detail-routing.module';

import { CarOrderDetailPage } from './car-order-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarOrderDetailPageRoutingModule,
    AppComponentsModule,
    OrderComponentsModule
  ],
  declarations: [CarOrderDetailPage]
})
export class CarOrderDetailPageModule { }
