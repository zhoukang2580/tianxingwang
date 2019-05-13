import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MyCredentialManagementAddPage } from './my-credential-management-add.page';

const routes: Routes = [
  {
    path: '',
    component: MyCredentialManagementAddPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MyCredentialManagementAddPage]
})
export class MyCredentialManagementAddPageModule {}
