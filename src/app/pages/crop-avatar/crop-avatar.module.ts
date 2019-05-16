import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CropAvatarPage } from './crop-avatar.page';
import { AppcomponentsModule } from 'src/app/components/appcomponents.module';

const routes: Routes = [
  {
    path: '',
    component: CropAvatarPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppcomponentsModule
  ],
  declarations: [CropAvatarPage]
})
export class CropAvatarPageModule {}
