import { AppComponentsModule } from './../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HrPage } from './hr.page';
import { HrComponentsModule } from '../components/hrcomponents.module';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: '',
    component: HrPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HrComponentsModule,
    AppComponentsModule
  ],
  declarations: [HrPage]
})
export class HrPageModule {}
