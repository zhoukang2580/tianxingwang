import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderHotelDetailEnPage } from './order-hotel-detail_en.page';


const routes: Routes = [
  {
    path: '',
    component: OrderHotelDetailEnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelOrderDetailPageRoutingModule {}
