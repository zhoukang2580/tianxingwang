import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProductTabTrainPage } from './product-tab-train.page';

const routes: Routes = [
  {
    path: '',
    component: ProductTabTrainPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductTabTrainPage]
})
export class ProductTabTrainPageModule {}
