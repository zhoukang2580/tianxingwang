import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandCarPageRoutingModule } from './demand-car-routing.module';

import { DemandCarPage } from './demand-car.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandCarPageRoutingModule
  ],
  declarations: [DemandCarPage]
})
export class DemandCarPageModule {}
