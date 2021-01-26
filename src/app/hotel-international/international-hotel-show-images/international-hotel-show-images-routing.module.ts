import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { InternationalHotelShowImagesPage } from './international-hotel-show-images.page';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelShowImagesPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelShowImagesPageRoutingModule {}
