import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { InterHotelBookDfPage } from "./inter-hotel-book-df.page";

const routes: Routes = [
  {
    path: "",
    component: InterHotelBookDfPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterHotelBookDfPageRoutingModule {}
