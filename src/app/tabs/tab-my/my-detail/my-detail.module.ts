import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MyDetailPage } from './my-detail.page';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { CropAvatarDirective } from 'src/app/directives/crop-avatar.directive';

const routes: Routes = [
  {
    path: '',
    component: MyDetailPage,
    canActivate:[AuthorityGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    // DirectivesModule
  ],
  declarations: [MyDetailPage,CropAvatarDirective]
})
export class MyDetailPageModule {}
