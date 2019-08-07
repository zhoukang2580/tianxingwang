import { OrderComponentsModule } from './../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProductTabsPage } from './product-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: ProductTabsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    OrderComponentsModule
  ],
  declarations: [ProductTabsPage]
})
export class ProductTabsPageModule {}
