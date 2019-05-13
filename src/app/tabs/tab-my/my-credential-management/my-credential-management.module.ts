import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MyCredentialManagementPage } from './my-credential-management.page';

const routes: Routes = [
  {
    path: '',
    component: MyCredentialManagementPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MyCredentialManagementPage]
})
export class MyCredentialManagementPageModule {}
