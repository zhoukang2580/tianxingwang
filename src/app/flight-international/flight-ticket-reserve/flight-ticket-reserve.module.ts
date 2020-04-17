import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FlightTicketReservePageRoutingModule } from './flight-ticket-reserve-routing.module';

import { FlightTicketReservePage } from './flight-ticket-reserve.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { TmcComponentsModule } from 'src/app/tmc/components/tmcComponents.module';
import { InternationalFlightComponentsModule } from '../components/international-flight.components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    FlightTicketReservePageRoutingModule,
    TmcComponentsModule,
    InternationalFlightComponentsModule
  ],
  declarations: [FlightTicketReservePage]
})
export class FlightTicketReservePageModule {}
