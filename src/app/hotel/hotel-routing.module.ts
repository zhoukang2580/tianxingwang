import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
export const routes: Routes = [
  {
    path: "search-hotel",
    loadChildren: "./search-hotel/search-hotel.module#SearchHotelPageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelRoutingModule {}
