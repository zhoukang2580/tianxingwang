import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes } from "@angular/router";
export const routes: Routes = [
  {
    path: "international-hotel-list",
    loadChildren: () =>
      import("./international-hotel-list/international-hotel-list.module").then(
        m => m.InternationalHotelListPageModule
      )
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelInternationalRoutingModule {}
