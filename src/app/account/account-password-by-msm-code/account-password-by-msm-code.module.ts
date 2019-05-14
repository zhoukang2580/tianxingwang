import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AccountPasswordByMsmCodePage } from './account-password-by-msm-code.page';
import { AuthorityGuard } from 'src/app/guards/authority.guard';

const routes: Routes = [
  {
    path: '',
    component: AccountPasswordByMsmCodePage,
    canActivate:[AuthorityGuard]
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
