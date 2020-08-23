import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HotelMapPage } from './hotel-map.page';

const routes: Routes = [
  {
    path: '',
    component: HotelMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelMapPageRoutingModule {}
