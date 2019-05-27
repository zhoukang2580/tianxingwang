import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
  { path: 'my-detail', loadChildren: "./my-detail/my-detail.module#MyDetailPageModule"},
  {
    path: 'my-credential-management',
    loadChildren: "./my-credential-management/my-credential-management.module#MyCredentialManagementPageModule"
  },
  {
    path: 'my-credential-management-add',
    loadChildren: "./my-credential-management-add/my-credential-management-add.module#MyCredentialManagementAddPageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[RouterModule]
})
export class MemberModule { }
