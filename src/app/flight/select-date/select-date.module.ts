import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectDatetimePage as SelectDatePage } from './select-date.page';
import { FlightComponentsModule } from '../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: SelectDatePage
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
  declarations: [SelectDatePage],
  entryComponents:[
    SelectDatePage
  ]
})
export class SelectDatePageModule {}
