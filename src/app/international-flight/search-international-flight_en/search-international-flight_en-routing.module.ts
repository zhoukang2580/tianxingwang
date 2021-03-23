import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SearchInternationalFlightEnPage } from "./search-international-flight_en.page";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: SearchInternationalFlightEnPage,
    canDeactivate: [CandeactivateGuard],
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchInternationalFlightEnPageRoutingModule {}
