import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
  { path: 'member-detail', loadChildren: "./member-detail/member-detail.module#MemberDetailPageModule"},
  {
    path: 'member-credential-management',
    loadChildren: "./member-credential-management/member-credential-management.module#MemberCredentialManagementPageModule"
  },
  {
    path: 'member-credential-management-add',
    loadChildren: "./member-credential-management-add/member-credential-management-add.module#MemberCredentialManagementAddPageModule"
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
