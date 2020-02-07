import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterHotelBookPage } from './inter-hotel-book.page';

const routes: Routes = [
  {
    path: '',
    component: InterHotelBookPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterHotelBookPageRoutingModule {}
