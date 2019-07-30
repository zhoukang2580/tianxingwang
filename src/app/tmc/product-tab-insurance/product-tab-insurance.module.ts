import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProductTabInsurancePage } from './product-tab-insurance.page';

const routes: Routes = [
  {
    path: '',
    component: ProductTabInsurancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductTabInsurancePage]
})
export class ProductTabInsurancePageModule {}
