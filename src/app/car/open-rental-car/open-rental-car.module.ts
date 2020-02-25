import { AppComponentsModule } from './../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenRentalCarPageRoutingModule } from './open-rental-car-routing.module';

import { OpenRentalCarPage } from './open-rental-car.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpenRentalCarPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [OpenRentalCarPage]
})
export class OpenRentalCarPageModule {}
