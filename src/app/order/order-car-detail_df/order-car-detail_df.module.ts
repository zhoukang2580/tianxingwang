import { OrderComponentsModule } from '../components/components.module';
import { AppComponentsModule } from '../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarOrderDetailDfPageRoutingModule } from './order-car-detail_df-routing.module';

import { CarOrderDetailDfPage } from './order-car-detail_df.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarOrderDetailDfPageRoutingModule,
    AppComponentsModule,
    OrderComponentsModule
  ],
  declarations: [CarOrderDetailDfPage]
})
export class OrderCarDetailDfPageModule { }
