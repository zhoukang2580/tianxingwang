import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterHotelBookEnPage } from './inter-hotel-book_en.page';

const routes: Routes = [
  {
    path: '',
    component: InterHotelBookEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterHotelBookEnPageRoutingModule {}
