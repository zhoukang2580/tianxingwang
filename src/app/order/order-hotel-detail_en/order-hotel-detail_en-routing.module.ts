import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { OrderHotelDetailEnPage } from './order-hotel-detail_en.page';


const routes: Routes = [
  {
    path: '',
    component: OrderHotelDetailEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelOrderDetailPageRoutingModule {}
