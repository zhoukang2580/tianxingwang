import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SwitchCompanyPage } from './switch-company.page';
import { AppcomponentsModule } from 'src/app/components/appcomponents.module';

const routes: Routes = [
  {
    path: '',
    component: SwitchCompanyPage
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
  declarations: [SwitchCompanyPage]
})
export class SwitchCompanyPageModule {}
