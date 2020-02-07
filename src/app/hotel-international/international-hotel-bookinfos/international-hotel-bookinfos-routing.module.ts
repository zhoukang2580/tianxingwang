import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternationalHotelBookinfosPage } from './international-hotel-bookinfos.page';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelBookinfosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelBookinfosPageRoutingModule {}
