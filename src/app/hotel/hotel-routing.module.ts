import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ConfirmCredentialInfoGuard } from "../guards/confirm-credential-info.guard";
export const routes: Routes = [
  {
    path: "search-hotel",
    loadChildren: () =>
      import("./search-hotel/search-hotel.module").then(
        m => m.SearchHotelPageModule
      )
  },
  {
    path: "search-hotel_en",
    loadChildren: () =>
      import("./search-hotel_en/search-hotel_en.module").then(
        m => m.SearchHotelEnPageModule
      )
  },
  {
    path: "hotel-city",
    loadChildren: () =>
      import("./hotel-city/hotel-city.module").then(m => m.HotelCityPageModule)
  },
  {
    path: "combox-search-hotel",
    loadChildren: () =>
      import("./combox-search-hotel/combox-search-hotel.module").then(
        m => m.ComboxSearchHotelPageModule
      )
  },
  {
    path: "hotel-show-images",
    loadChildren: () =>
      import("./show-images/show-images.module").then(
        m => m.ShowImagesPageModule
      )
  },
  {
    path: "hotel-room-detail",
    loadChildren: () =>
      import("./room-detail/room-detail.module").then(
        m => m.RoomDetailPageModule
      )
  },
  {
    path: "hotel-room-bookedinfos",
    loadChildren: () =>
      import("./hotel-room-bookedinfos/hotel-room-bookedinfos.module").then(
        m => m.HotelRoomBookedInfosPageModule
      )
  },
  {
    path: "hotel-room-bookedinfos_en",
    loadChildren: () =>
      import("./hotel-room-bookedinfos_en/hotel-room-bookedinfos_en.module").then(
        m => m.HotelRoomBookedInfosEnPageModule
      )
  },
  {
    path: "hotel-list",
    loadChildren: () =>
      import("./hotel-list/hotel-list.module").then(m => m.HotelListPageModule)
  },
  {
    path: "hotel-list_en",
    loadChildren: () =>
      import("./hotel-list_en/hotel-list_en.module").then(m => m.HotelListEnPageModule)
  },
  {
    path: "hotel-detail",
    loadChildren: () =>
      import("./hotel-detail/hotel-detail.module").then(
        m => m.HotelDetailPageModule
      )
  },
  {
    path: "hotel-detail_en",
    loadChildren: () =>
      import("./hotel-detail_en/hotel-detail_en.module").then(
        m => m.HotelDetailEnPageModule
      )
  },
  {
    path: "hotel-book",
    loadChildren: () => import("./book/book.module").then(m => m.BookPageModule)
  },
  {
    path: "hotel-book_en",
    loadChildren: () => import("./book_en/book_en.module").then(m => m.BookEnPageModule)
  },
  {
    path: 'hotel-map',
    loadChildren: () => import('./hotel-map/hotel-map.module').then( m => m.HotelMapPageModule)
  }

];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelRoutingModule {}
