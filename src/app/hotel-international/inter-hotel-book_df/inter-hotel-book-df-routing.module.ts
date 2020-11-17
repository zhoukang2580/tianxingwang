import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterHotelBookDfPage } from './inter-hotel-book-df.page';

const routes: Routes = [
  {
    path: '',
    component: InterHotelBookDfPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterHotelBookDfPageRoutingModule {}
