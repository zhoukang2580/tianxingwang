import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ConfirmCredentialInfoGuard } from '../guards/confirm-credential-info.guard';
export const routes: Routes = [
  {
    path: "search-hotel",
    loadChildren: "./search-hotel/search-hotel.module#SearchHotelPageModule"
  },
  { path: 'hotel-city', loadChildren: './hotel-city/hotel-city.module#HotelCityPageModule' },
  { path: 'hotel-list', loadChildren: './hotel-list/hotel-list.module#HotelListPageModule' },
  { path: 'hotel-detail', loadChildren: './hotel-detail/hotel-detail.module#HotelDetailPageModule' },
  { path: 'hotel-book', loadChildren: './book/book.module#BookPageModule' }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelRoutingModule { }
