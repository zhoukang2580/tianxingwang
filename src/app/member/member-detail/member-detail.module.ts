import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MemberDetailPage } from './member-detail.page';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { DirectivesModule } from 'src/app/directives/directives.module';

const routes: Routes = [
  {
    path: '',
    component: MemberDetailPage,
    canActivate:[AuthorityGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    DirectivesModule
  ],
  declarations: [MemberDetailPage]
})
export class MemberDetailPageModule {}
