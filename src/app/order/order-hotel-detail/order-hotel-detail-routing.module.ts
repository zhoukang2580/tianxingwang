import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { OrderHotelDetailPage } from './order-hotel-detail.page';


const routes: Routes = [
  {
    path: '',
    component: OrderHotelDetailPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelOrderDetailPageRoutingModule { }
