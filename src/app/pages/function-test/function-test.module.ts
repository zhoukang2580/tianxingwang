import { AppcomponentsModule } from 'src/app/components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FunctionTestPage } from './function-test.page';

const routes: Routes = [
  {
    path: '',
    component: FunctionTestPage
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
  declarations: [FunctionTestPage]
})
export class FunctionTestPageModule {}
