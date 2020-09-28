import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { SearchInternationalHotelEnPage } from './search-international-hotel_en.page';

const routes: Routes = [
  {
    path: '',
    component: SearchInternationalHotelEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchInternationalHotelPageEnRoutingModule {}
