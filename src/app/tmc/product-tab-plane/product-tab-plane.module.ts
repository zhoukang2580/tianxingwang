import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProductTabPlanePage } from './product-tab-plane.page';

const routes: Routes = [
  {
    path: '',
    component: ProductTabPlanePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductTabPlanePage]
})
export class ProductTabPlanePageModule {}
