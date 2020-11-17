import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes } from "@angular/router";
export const routes: Routes = [
  {
    path: "international-hotel-list",
    loadChildren: () =>
      import("./international-hotel-list/international-hotel-list.module").then(
        (m) => m.InternationalHotelListPageModule
      ),
  },
  {
    path: "international-hotel-list_df",
    loadChildren: () =>
      import("./international-hotel-list_df/international-hotel-list-df.module").then(
        (m) => m.InternationalHotelListDfPageModule
      ),
  },
  {
    path: "international-hotel-list_en",
    loadChildren: () =>
      import(
        "./international-hotel-list_en/international-hotel-list_en.module"
      ).then((m) => m.InternationalHotelListEnPageModule),
  },
  {
    path: "select-inter-city",
    loadChildren: () =>
      import("./select-inter-city/select-inter-city.module").then(
        (m) => m.SelectInterCityPageModule
      ),
  },
  {
    path: "select-inter-city_en",
    loadChildren: () =>
      import("./select-inter-city_en/select-inter-city_en.module").then(
        (m) => m.SelectInterCityEnPageModule
      ),
  },
  {
    path: "international-hotel-detail",
    loadChildren: () =>
      import(
        "./international-hotel-detail/international-hotel-detail.module"
      ).then((m) => m.InternationalHotelDetailPageModule),
  },
  {
    path: "international-hotel-detail_df",
    loadChildren: () =>
      import(
        "./international-hotel-detail_df/international-hotel-detail-df.module"
      ).then((m) => m.InternationalHotelDetailDfPageModule),
  },
  {
    path: "international-hotel-detail_en",
    loadChildren: () =>
      import(
        "./international-hotel-detail_en/international-hotel-detail_en.module"
      ).then((m) => m.InternationalHotelDetailEnPageModule),
  },
  {
    path: "international-hotel-show-images",
    loadChildren: () =>
      import(
        "./international-hotel-show-images/international-hotel-show-images.module"
      ).then((m) => m.InternationalHotelShowImagesPageModule),
  },
  {
    path: "international-room-detail",
    loadChildren: () =>
      import(
        "./international-room-detail/international-room-detail.module"
      ).then((m) => m.InternationalRoomDetailPageModule),
  },
  {
    path: "international-room-detail_en",
    loadChildren: () =>
      import(
        "./international-room-detail_en/international-room-detail_en.module"
      ).then((m) => m.InternationalRoomDetailEnPageModule),
  },
  {
    path: "combo-search-inter-hotel",
    loadChildren: () =>
      import("./combo-search-inter-hotel/combo-search-inter-hotel.module").then(
        (m) => m.ComboSearchInterHotelPageModule
      ),
  },
  {
    path: "international-hotel-bookinfos",
    loadChildren: () =>
      import(
        "./international-hotel-bookinfos/international-hotel-bookinfos.module"
      ).then((m) => m.InternationalHotelBookinfosPageModule),
  },
  {
    path: "international-hotel-bookinfos_en",
    // tslint:disable-next-line: max-line-length
    loadChildren: () =>
      import(
        "./international-hotel-bookinfos_en/international-hotel-bookinfos_en.module"
      ).then((m) => m.InternationalHotelBookinfosEnPageModule),
  },
  {
    path: "international-hotel-book",
    loadChildren: () =>
      import("./inter-hotel-book/inter-hotel-book.module").then(
        (m) => m.InterHotelBookPageModule
      ),
  },
  {
    path: "international-hotel-book_df",
    loadChildren: () =>
      import("./inter-hotel-book_df/inter-hotel-book-df.module").then(
        (m) => m.InterHotelBookDfPageModule
      ),
  },
  {
    path: "international-hotel-book_en",
    loadChildren: () =>
      import("./inter-hotel-book_en/inter-hotel-book_en.module").then(
        (m) => m.InterHotelBookEnPageModule
      ),
  },
  {
    path: "search-international-hotel",
    loadChildren: () =>
      import(
        "./search-international-hotel/search-international-hotel.module"
      ).then((m) => m.SearchInternationalHotelPageModule),
  },
  {
    path: "search-international-hotel_en",
    loadChildren: () =>
      import(
        "./search-international-hotel_en/search-international-hotel_en.module"
      ).then((m) => m.SearchInternationalHotelEnPageModule),
  },
  {
    path: "room-count-children",
    loadChildren: () =>
      import("./room-count-children/room-count-children.module").then(
        (m) => m.RoomCountChildrenPageModule
      ),
  },
  {
    path: "select-nationality",
    loadChildren: () =>
      import("./select-nationality/select-nationality.module").then(
        (m) => m.SelectNationalityPageModule
      ),
  },
  {
    path: "inter-hotel-map",
    loadChildren: () =>
      import("./inter-hotel-map/inter-hotel-map.module").then(
        (m) => m.InterHotelMapPageModule
      ),
  },
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotelInternationalRoutingModule {}
