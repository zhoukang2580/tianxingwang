import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AvatarCropPage } from './avatar-crop.page';

const routes: Routes = [
  {
    path: '',
    component: AvatarCropPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AvatarCropPage]
})
export class AvatarCropPageModule {}
