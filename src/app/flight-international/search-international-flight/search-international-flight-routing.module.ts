import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SearchInternationalFlightPage } from "./search-international-flight.page";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";

const routes: Routes = [
  {
    path: "",
    component: SearchInternationalFlightPage,
    canDeactivate: [CandeactivateGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchInternationalFlightPageRoutingModule {}
