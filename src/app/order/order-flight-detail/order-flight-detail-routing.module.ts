import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderFlightDetailPage } from './order-flight-detail.page';

const routes: Routes = [
  {
    path: '',
    component: OrderFlightDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightOrderDetailPageRoutingModule {}
