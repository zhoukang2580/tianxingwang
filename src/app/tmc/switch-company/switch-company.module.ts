import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SwitchCompanyPage } from './switch-company.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: '',
    component: SwitchCompanyPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [SwitchCompanyPage]
})
export class SwitchCompanyPageModule {}
