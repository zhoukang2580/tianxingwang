import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectFlyDaysPage } from './select-fly-days.page';
import { FlightComponentsModule } from '../components/components.module';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: SelectFlyDaysPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlightComponentsModule
  ],
  declarations: [SelectFlyDaysPage],
  exports:[
    SelectFlyDaysPage
  ]
})
export class SelectFlyDaysPageModule {}
