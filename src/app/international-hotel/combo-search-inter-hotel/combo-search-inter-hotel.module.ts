import { AppComponentsModule } from '../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ComboSearchInterHotelPageRoutingModule } from './combo-search-inter-hotel-routing.module';
import { ComboSearchInterHotelPage } from './combo-search-inter-hotel.page';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComboSearchInterHotelPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [ComboSearchInterHotelPage]
})
export class ComboSearchInterHotelPageModule {}
