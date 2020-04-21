import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HotelOrderDetailPage } from './hotel-order-detail.page';


const routes: Routes = [
  {
    path: '',
    component: HotelOrderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelOrderDetailPageRoutingModule {}
