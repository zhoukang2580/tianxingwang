import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchHotelByTextPage } from './search-hotel-byText.page';


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
