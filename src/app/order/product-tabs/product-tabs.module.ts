import { OrderComponentsModule } from './../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProductTabsPage } from './product-tabs.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

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
    OrderComponentsModule,
    AppComponentsModule
  ],
  declarations: [ProductTabsPage]
})
export class ProductTabsPageModule {}
