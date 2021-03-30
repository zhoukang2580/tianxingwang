import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternationalHotelBookinfosEnPage } from './international-hotel-bookinfos_en.page';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelBookinfosEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelBookinfosPageRoutingModule {}
