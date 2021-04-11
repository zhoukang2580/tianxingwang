import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { ComboSearchInterHotelPage } from './combo-search-inter-hotel.page';

const routes: Routes = [
  {
    path: '',
    component: ComboSearchInterHotelPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComboSearchInterHotelPageRoutingModule {}
