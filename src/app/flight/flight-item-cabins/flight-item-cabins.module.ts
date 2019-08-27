import { FlightComponentsModule } from './../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FlightItemCabinsPage } from './flight-item-cabins.page';
import { FlightDirectivesModule } from '../directives/directives.module';

const routes: Routes = [
  {
    path: '',
    component: FlightItemCabinsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightComponentsModule,
    RouterModule.forChild(routes),
    FlightDirectivesModule
  ],
  declarations: [FlightItemCabinsPage]
})
export class FlightItemCabinsPageModule {}
