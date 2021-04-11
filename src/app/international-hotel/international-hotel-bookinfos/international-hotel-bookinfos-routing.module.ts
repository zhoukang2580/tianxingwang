import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { InternationalHotelBookinfosPage } from './international-hotel-bookinfos.page';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelBookinfosPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelBookinfosPageRoutingModule {}
