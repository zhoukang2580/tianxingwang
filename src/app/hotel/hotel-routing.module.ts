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
    path: "hotel-list",
    loadChildren: () =>
      import("./hotel-list/hotel-list.module").then(m => m.HotelListPageModule)
  },
  {
    path: "hotel-detail",
    loadChildren: () =>
      import("./hotel-detail/hotel-detail.module").then(
        m => m.HotelDetailPageModule
      )
  },
  {
    path: "hotel-book",
    loadChildren: () => import("./book/book.module").then(m => m.BookPageModule)
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelRoutingModule {}
