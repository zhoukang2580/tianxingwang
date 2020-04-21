import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AccountEmailPage } from './account-email.page';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

const routes: Routes = [
  {
    path: '',
    canActivate:[AuthorityGuard],
    component: AccountEmailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [AccountEmailPage]
})
export class AccountEmailPageModule {}
