import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  { path: 'password-check', loadChildren: './password-check/password-check.module#PasswordCheckPageModule' },
  { path: 'password-code', loadChildren: './password-code/password-code.module#PasswordCodePageModule' },
  { path: 'password-reset', loadChildren: './password-reset/password-reset.module#PasswordResetPageModule' }

];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[RouterModule]
}) 

export class PasswordModule { }
