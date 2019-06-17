import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectCityPage } from './select-city.page';
import { ComponentsModule } from './../components/components.module';

const routes: Routes = [
  {
    path: 'select-city',
    component: SelectCityPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ],
  declarations: [SelectCityPage],
  exports:[SelectCityPage],
  entryComponents:[SelectCityPage]
})
export class SelectCityPageModule {}
