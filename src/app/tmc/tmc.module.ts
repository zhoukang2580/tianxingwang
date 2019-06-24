import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmcRoutingModule } from './tmc-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TmcRoutingModule
  ],
  exports:[TmcRoutingModule]
})
export class TmcModule { }
