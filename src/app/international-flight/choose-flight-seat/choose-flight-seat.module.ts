import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseFlightSeatPageRoutingModule } from './choose-flight-seat-routing.module';

import { ChooseFlightSeatPage } from './choose-flight-seat.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChooseFlightSeatPageRoutingModule,
    AppComponentsModule,
  ],
  declarations: [ChooseFlightSeatPage]
})
export class ChooseFlightSeatPageModule {}
