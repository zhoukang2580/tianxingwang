import { TmcComponentsModule } from '../../tmc/components/tmcComponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterHotelBookEnPageRoutingModule } from './inter-hotel-book-routing_en.module';

import { InterHotelBookEnPage } from './inter-hotel-book_en.page';
import { HotelInternationalComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterHotelBookEnPageRoutingModule,
    TmcComponentsModule,
    HotelInternationalComponentsModule
  ],
  declarations: [InterHotelBookEnPage]
})
export class InterHotelBookEnPageModule {}
