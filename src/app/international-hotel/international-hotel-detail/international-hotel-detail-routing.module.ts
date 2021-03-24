import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { InternationalHotelDetailPage } from './international-hotel-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelDetailPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelDetailPageRoutingModule {}
