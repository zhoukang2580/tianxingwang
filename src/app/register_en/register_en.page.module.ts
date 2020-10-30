import { StylePageGuard } from './../guards/style-page.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RegisterEnPage } from './register_en.page';
import { AppComponentsModule } from '../components/appcomponents.module';

const routes: Routes = [
  {
    path: '',
    component: RegisterEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [RegisterEnPage]
})
export class RegisterEnPageModule {}
