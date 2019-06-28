import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectDatetimePage } from './select-datetime.page';
import { FlightComponentsModule } from './../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: SelectDatetimePage
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
  declarations: [SelectDatetimePage],
  entryComponents:[
    SelectDatetimePage
  ]
})
export class SelectDatetimePageModule {}
