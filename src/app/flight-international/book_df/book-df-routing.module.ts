import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StylePageGuard } from "src/app/guards/style-page.guard";

import { FlightBookDfPage } from "./book-df.page";

const routes: Routes = [
  {
    path: "",
    component: FlightBookDfPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightBookDfPageRoutingModule {}
