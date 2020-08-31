import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderHotelDetailPage } from './order-hotel-detail.page';


const routes: Routes = [
  {
    path: '',
    component: OrderHotelDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelOrderDetailPageRoutingModule {}
