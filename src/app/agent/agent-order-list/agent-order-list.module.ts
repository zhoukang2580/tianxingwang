import { AppComponentsModule } from '../../components/appcomponents.module';
import { OrderComponentsModule } from '../../order/components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AgentOrderListPage } from './agent-order-list.page';

const routes: Routes = [
  {
    path: '',
    component: AgentOrderListPage
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
  declarations: [AgentOrderListPage]
})
export class AgentOrderListPageModule {}
