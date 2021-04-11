import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StylePageGuard } from "src/app/guards/style-page.guard";

import { SelectedTripInfoPage } from "./selected-trip-info.page";

const routes: Routes = [
  {
    path: "",
    component: SelectedTripInfoPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectedTripInfoPageRoutingModule {}
