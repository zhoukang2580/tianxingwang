import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlightDynamicRoutingModule } from './flight-dynamic-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FlightDynamicRoutingModule,
    BrowserModule,
    FormsModule
  ],
  exports:[
    FlightDynamicRoutingModule
  ]
})
export class FlightDynamicModule { }
