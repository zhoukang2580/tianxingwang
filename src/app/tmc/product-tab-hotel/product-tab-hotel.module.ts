import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProductTabHotelPage } from './product-tab-hotel.page';

const routes: Routes = [
  {
    path: '',
    component: ProductTabHotelPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductTabHotelPage]
})
export class ProductTabHotelPageModule {}
