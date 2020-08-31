import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TravelApplyDetailPageRoutingModule } from './travel-apply-detail-routing.module';

import { TravelApplyDetailPage } from './travel-apply-detail.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TravelApplyDetailPageRoutingModule,
    AppComponentsModule

  ],
  declarations: [TravelApplyDetailPage]
})
export class TravelApplyDetailPageModule {}
