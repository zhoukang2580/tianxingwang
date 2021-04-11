import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SearchInternationalFlightPage } from "./search-international-flight.page";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";
import { StylePageGuard } from "src/app/guards/style-page.guard";

const routes: Routes = [
  {
    path: "",
    component: SearchInternationalFlightPage,
    canDeactivate: [CandeactivateGuard],
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchInternationalFlightPageRoutingModule {}
