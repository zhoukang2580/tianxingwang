import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { OrderFlightDetailEnPage } from './order-flight-detail_en.page';

const routes: Routes = [
  {
    path: '',
    component: OrderFlightDetailEnPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightOrderDetailEnPageRoutingModule {}
