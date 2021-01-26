import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StylePageGuard } from "src/app/guards/style-page.guard";

import { FlightListEnPage } from "./flight-list_en.page";

const routes: Routes = [
  {
    path: "",
    component: FlightListEnPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightListPageEnRoutingModule {}
