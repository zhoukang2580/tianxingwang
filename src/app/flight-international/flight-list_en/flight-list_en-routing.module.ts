import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlightListEnPage } from './flight-list_en.page';

const routes: Routes = [
  {
    path: '',
    component: FlightListEnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightListPageEnRoutingModule {}
