import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenRentalCarPage } from './open-rental-car.page';

const routes: Routes = [
  {
    path: '',
    component: OpenRentalCarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenRentalCarPageRoutingModule {}
