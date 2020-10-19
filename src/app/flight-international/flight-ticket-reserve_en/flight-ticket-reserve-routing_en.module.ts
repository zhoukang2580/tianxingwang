import { StylePageGuard } from './../../guards/style-page.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlightTicketReserveEnPage } from './flight-ticket-reserve_en.page';

const routes: Routes = [
  {
    path: '',
    component: FlightTicketReserveEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightTicketReserveEnPageRoutingModule {}
