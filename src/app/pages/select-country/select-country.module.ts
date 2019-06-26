import { AppcomponentsModule } from './../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectCountryPage } from './select-country.page';

const routes: Routes = [
  {
    path: '',
    component: SelectCountryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppcomponentsModule
  ],
  declarations: [SelectCountryPage]
})
export class SelectCountryPageModule {}
