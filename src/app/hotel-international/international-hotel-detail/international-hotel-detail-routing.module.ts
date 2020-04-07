import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternationalHotelDetailPage } from './international-hotel-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelDetailPageRoutingModule {}
