import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { OrderFlightDetailPage } from './order-flight-detail.page';

const routes: Routes = [
  {
    path: '',
    component: OrderFlightDetailPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightOrderDetailPageRoutingModule {}
