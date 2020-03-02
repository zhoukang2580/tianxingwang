import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarOrderDetailPage } from './car-order-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CarOrderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarOrderDetailPageRoutingModule {}
