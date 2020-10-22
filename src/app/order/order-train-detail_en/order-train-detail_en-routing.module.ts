import { StylePageGuard } from './../../guards/style-page.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderTrainDetailEnPage } from './order-train-detail_en.page';

const routes: Routes = [
  {
    path: '',
    component: OrderTrainDetailEnPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainOrderDetailPageRoutingModule {}
