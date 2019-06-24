import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ComfirmInformationPage } from './confirm-information.page';

const routes: Routes = [
  {
    path: '',
    component: ComfirmInformationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ComfirmInformationPage]
})
export class ComfirmInformationPageModule {}
