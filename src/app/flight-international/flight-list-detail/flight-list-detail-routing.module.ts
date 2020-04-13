import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlightListDetailPage } from './flight-list-detail.page';

const routes: Routes = [
  {
    path: '',
    component: FlightListDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightListDetailPageRoutingModule {}
