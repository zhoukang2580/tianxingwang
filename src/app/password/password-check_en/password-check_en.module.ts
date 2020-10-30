import { StylePageGuard } from './../../guards/style-page.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PasswordCheckEnPage } from './password-check_en.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

const routes: Routes = [
  {
    path: '',
    component: PasswordCheckEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [PasswordCheckEnPage]
})
export class PasswordCheckEnPageModule {}
