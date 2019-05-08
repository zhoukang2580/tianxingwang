import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AccountPasswordByMsmCodePage } from './account-password-by-msm-code.page';

const routes: Routes = [
  {
    path: '',
    component: AccountPasswordByMsmCodePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AccountPasswordByMsmCodePage]
})
export class AccountPasswordByMsmCodePageModule {}
