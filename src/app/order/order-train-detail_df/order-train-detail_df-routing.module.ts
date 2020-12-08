import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { OrderTrainDetailDfPage } from './order-train-detail_df.page';

const routes: Routes = [
  {
    path: '',
    component: OrderTrainDetailDfPage,
    canActivate: [StylePageGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainOrderDetailDfPageRoutingModule {}
