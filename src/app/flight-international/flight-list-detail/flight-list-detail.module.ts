import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FlightListDetailPageRoutingModule } from './flight-list-detail-routing.module';

import { FlightListDetailPage } from './flight-list-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightListDetailPageRoutingModule
  ],
  declarations: [FlightListDetailPage]
})
export class FlightListDetailPageModule {}
