import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import {  MemberCredentialManagementAddPage } from './member-credential-management-add.page';
import { AuthorityGuard } from 'src/app/guards/authority.guard';

const routes: Routes = [
  {
    path: '',
    component: MemberCredentialManagementAddPage,
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
  declarations: [MemberCredentialManagementAddPage]
})
export class MemberCredentialManagementAddPageModule {}
