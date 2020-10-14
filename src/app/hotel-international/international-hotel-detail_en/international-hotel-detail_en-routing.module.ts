import { StylePageGuard } from './../../guards/style-page.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternationalHotelDetailEnPage } from './international-hotel-detail_en.page';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelDetailEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelDetailEnPageRoutingModule {}
