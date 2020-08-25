import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterHotelMapPage } from './inter-hotel-map.page';

const routes: Routes = [
  {
    path: '',
    component: InterHotelMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterHotelMapPageRoutingModule {}
