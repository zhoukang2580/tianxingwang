import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { CarOrderDetailPage } from './order-car-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CarOrderDetailPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarOrderDetailPageRoutingModule {}
