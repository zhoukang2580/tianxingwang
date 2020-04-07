import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchInternationalHotelPage } from './search-international-hotel.page';

const routes: Routes = [
  {
    path: '',
    component: SearchInternationalHotelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchInternationalHotelPageRoutingModule {}
