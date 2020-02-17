import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComboSearchInterHotelPage } from './combo-search-inter-hotel.page';

const routes: Routes = [
  {
    path: '',
    component: ComboSearchInterHotelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComboSearchInterHotelPageRoutingModule {}
