import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainOrderDetailPage } from './train-order-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TrainOrderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainOrderDetailPageRoutingModule {}
