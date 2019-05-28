import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { MemberCredentialManagementPage } from './member-credential-management.page';

const routes: Routes = [
  {
    path: '',
    component: MemberCredentialManagementPage,
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
  declarations: [MemberCredentialManagementPage]
})
export class MemberCredentialManagementPageModule {}
