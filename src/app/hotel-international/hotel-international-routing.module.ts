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
  },
  {
    path: "select-inter-city",
    loadChildren: () =>
      import("./select-inter-city/select-inter-city.module").then(
        m => m.SelectInterCityPageModule
      )
  },
  {
    path: "international-hotel-detail",
    loadChildren: () =>
      import(
        "./international-hotel-detail/international-hotel-detail.module"
      ).then(m => m.InternationalHotelDetailPageModule)
  },
  {
    path: "international-hotel-show-images",
    loadChildren: () =>
      import(
        "./international-hotel-show-images/international-hotel-show-images.module"
      ).then(m => m.InternationalHotelShowImagesPageModule)
  },
  {
    path: "international-room-detail",
    loadChildren: () =>
      import(
        "./international-room-detail/international-room-detail.module"
      ).then(m => m.InternationalRoomDetailPageModule)
  },
  {
    path: 'search-by-text',
    loadChildren: () => import('./search-by-text/search-by-text.module').then( m => m.SearchByTextPageModule)
  },
  {
    path: 'international-hotel-bookinfos',
    loadChildren: () => import('./international-hotel-bookinfos/international-hotel-bookinfos.module').then( m => m.InternationalHotelBookinfosPageModule)
  },
  {
    path: 'inter-hotel-book',
    loadChildren: () => import('./inter-hotel-book/inter-hotel-book.module').then( m => m.InterHotelBookPageModule)
  },
  {
    path: 'search-international-hotel',
    loadChildren: () => import('./search-international-hotel/search-international-hotel.module').then( m => m.SearchInternationalHotelPageModule)
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelInternationalRoutingModule {}
