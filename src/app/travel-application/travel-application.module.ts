import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelApplicationRoutingModule } from './travel-application-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TravelApplicationRoutingModule
  ],
  exports:[TravelApplicationRoutingModule]
})
export class TravelApplicationModule { }
