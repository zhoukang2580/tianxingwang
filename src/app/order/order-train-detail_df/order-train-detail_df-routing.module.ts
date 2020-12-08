import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderTrainDetailDfPage } from './order-train-detail_df.page';

const routes: Routes = [
  {
    path: '',
    component: OrderTrainDetailDfPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainOrderDetailDfPageRoutingModule {}
