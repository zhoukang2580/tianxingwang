import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import {  MemberCredentialManagementSavePage } from './member-credential-management-save.page';
import { AuthorityGuard } from 'src/app/guards/authority.guard';

const routes: Routes = [
  {
    path: '',
    component: MemberCredentialManagementSavePage,
    canActivate:[AuthorityGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [MemberCredentialManagementSavePage]
})
export class MemberCredentialManagementSavePageModule {}
