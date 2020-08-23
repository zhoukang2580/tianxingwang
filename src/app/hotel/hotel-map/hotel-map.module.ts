import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { HotelComponentsModule } from './../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HotelMapPageRoutingModule } from './hotel-map-routing.module';

import { HotelMapPage } from './hotel-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HotelMapPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [HotelMapPage]
})
export class HotelMapPageModule {}
