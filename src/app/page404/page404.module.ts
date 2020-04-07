import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { Page404Page } from './page404.page';
import { ToDefaultRouteGuard } from '../guards/to-default-route.guard';

const routes: Routes = [
  {
    path: '',
    component: Page404Page,
    canActivate:[ToDefaultRouteGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [Page404Page]
})
export class Page404PageModule {}
