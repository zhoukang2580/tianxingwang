import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FlightBookDfPageRoutingModule } from './book-df-routing.module';

import { FlightBookDfPage } from './book-df.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { TmcComponentsModule } from 'src/app/tmc/components/tmcComponents.module';
import { InternationalFlightComponentsModule } from '../components/international-flight.components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    FlightBookDfPageRoutingModule,
    TmcComponentsModule,
    InternationalFlightComponentsModule
  ],
  declarations: [FlightBookDfPage]
})
export class FlightBookDfPageModule {}
