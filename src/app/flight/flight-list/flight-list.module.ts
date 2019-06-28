import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FlightListPage } from './flight-list.page';
import { SelectFlyDaysPageModule } from '../select-fly-days/select-fly-days.module';
import { FlightComponentsModule } from '../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: FlightListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlightComponentsModule,
  ],
  declarations: [FlightListPage]
})
export class FlightListPageModule {}
