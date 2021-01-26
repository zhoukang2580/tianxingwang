import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StylePageGuard } from "src/app/guards/style-page.guard";

import { ChooseFlightSeatPage } from "./choose-flight-seat.page";

const routes: Routes = [
  {
    path: "",
    component: ChooseFlightSeatPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseFlightSeatPageRoutingModule {}
