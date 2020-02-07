import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterHotelBookPageRoutingModule } from './inter-hotel-book-routing.module';

import { InterHotelBookPage } from './inter-hotel-book.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterHotelBookPageRoutingModule
  ],
  declarations: [InterHotelBookPage]
})
export class InterHotelBookPageModule {}
