import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
export const routes: Routes = [
  {
    path: "search-hotel",
    loadChildren: "./search-hotel/search-hotel.module#SearchHotelPageModule"
  },
  { path: 'hotel-city', loadChildren: './hotel-city/hotel-city.module#HotelCityPageModule' },
  { path: 'hotel-list', loadChildren: './hotel-list/hotel-list.module#HotelListPageModule' },
  { path: 'hotel-detail', loadChildren: './hotel-detail/hotel-detail.module#HotelDetailPageModule' }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelRoutingModule {}
