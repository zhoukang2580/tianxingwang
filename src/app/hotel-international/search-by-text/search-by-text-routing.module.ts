import { SearchHotelByTextPage } from './../../hotel/search-hotel-byTtext/search-hotel-byText.page';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: SearchHotelByTextPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchByTextPageRoutingModule {}
