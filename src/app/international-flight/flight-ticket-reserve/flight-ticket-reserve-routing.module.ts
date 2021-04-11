import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StylePageGuard } from "src/app/guards/style-page.guard";

import { FlightTicketReservePage } from "./flight-ticket-reserve.page";

const routes: Routes = [
  {
    path: "",
    component: FlightTicketReservePage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightTicketReservePageRoutingModule {}
