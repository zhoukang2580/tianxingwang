import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternationalHotelShowImagesPage } from './international-hotel-show-images.page';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelShowImagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelShowImagesPageRoutingModule {}
