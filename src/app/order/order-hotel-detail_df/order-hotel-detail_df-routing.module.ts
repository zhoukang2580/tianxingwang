import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderHotelDetailDfPage } from './order-hotel-detail_df.page';


const routes: Routes = [
  {
    path: '',
    component: OrderHotelDetailDfPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelOrderDetailDfPageRoutingModule {}
