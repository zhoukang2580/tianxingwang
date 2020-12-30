import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AirportServicesPageRoutingModule } from './airport-services-routing.module';

import { AirportServicesPage } from './airport-services.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AirportServicesPageRoutingModule
  ],
  declarations: [AirportServicesPage]
})
export class AirportServicesPageModule {}
