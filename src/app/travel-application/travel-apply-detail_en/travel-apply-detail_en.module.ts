import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TravelApplyDetailPageRoutingModule } from './travel-apply-detail-routing_en.module';

import { TravelApplyDetailEnPage } from './travel-apply-detail_en.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TravelApplyDetailPageRoutingModule,
    AppComponentsModule

  ],
  declarations: [TravelApplyDetailEnPage]
})
export class TravelApplyDetailEnPageModule {}
