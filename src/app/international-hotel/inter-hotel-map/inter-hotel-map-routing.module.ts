import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { InterHotelMapPage } from './inter-hotel-map.page';

const routes: Routes = [
  {
    path: '',
    component: InterHotelMapPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterHotelMapPageRoutingModule {}
