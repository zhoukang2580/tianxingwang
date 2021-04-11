import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { OrderTrainDetailPage } from './order-train-detail.page';

const routes: Routes = [
  {
    path: '',
    component: OrderTrainDetailPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainOrderDetailPageRoutingModule {}
