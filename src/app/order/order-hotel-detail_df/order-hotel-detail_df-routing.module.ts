import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { OrderHotelDetailDfPage } from './order-hotel-detail_df.page';


const routes: Routes = [
  {
    path: '',
    component: OrderHotelDetailDfPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelOrderDetailDfPageRoutingModule { }
