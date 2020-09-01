import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderTrainDetailPage } from './order-train-detail.page';

const routes: Routes = [
  {
    path: '',
    component: OrderTrainDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainOrderDetailPageRoutingModule {}
