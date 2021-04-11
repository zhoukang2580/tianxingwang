import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { SearchInternationalHotelPage } from './search-international-hotel.page';

const routes: Routes = [
  {
    path: '',
    component: SearchInternationalHotelPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchInternationalHotelPageRoutingModule {}
