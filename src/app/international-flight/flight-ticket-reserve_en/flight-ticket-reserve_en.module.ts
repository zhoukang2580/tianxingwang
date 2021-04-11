import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FlightTicketReserveEnPageRoutingModule } from './flight-ticket-reserve-routing_en.module';

import { FlightTicketReserveEnPage } from './flight-ticket-reserve_en.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { TmcComponentsModule } from 'src/app/tmc/components/tmcComponents.module';
import { InternationalFlightComponentsModule } from '../components/international-flight.components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    FlightTicketReserveEnPageRoutingModule,
    TmcComponentsModule,
    InternationalFlightComponentsModule
  ],
  declarations: [FlightTicketReserveEnPage]
})
export class FlightTicketReserveEnPageModule {}
