import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StylePageGuard } from "src/app/guards/style-page.guard";

import { InternationalHotelDetailDfPage } from "./international-hotel-detail-df.page";

const routes: Routes = [
  {
    path: "",
    component: InternationalHotelDetailDfPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalHotelDetailDfPageRoutingModule {}
