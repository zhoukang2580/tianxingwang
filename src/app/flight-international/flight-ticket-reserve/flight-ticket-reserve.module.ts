import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FlightTicketReservePageRoutingModule } from './flight-ticket-reserve-routing.module';

import { FlightTicketReservePage } from './flight-ticket-reserve.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    FlightTicketReservePageRoutingModule
  ],
  declarations: [FlightTicketReservePage]
})
export class FlightTicketReservePageModule {}
