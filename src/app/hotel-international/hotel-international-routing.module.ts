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
    path: 'combo-search-inter-hotel',
    loadChildren: () => import('./combo-search-inter-hotel/combo-search-inter-hotel.module').then( m => m.ComboSearchInterHotelPageModule)
  },
  {
    path: 'international-hotel-bookinfos',
    loadChildren: () => import('./international-hotel-bookinfos/international-hotel-bookinfos.module').then( m => m.InternationalHotelBookinfosPageModule)
  },
  {
    path: 'international-hotel-book',
    loadChildren: () => import('./inter-hotel-book/inter-hotel-book.module').then( m => m.InterHotelBookPageModule)
  },
  {
    path: 'search-international-hotel',
    loadChildren: () => import('./search-international-hotel/search-international-hotel.module').then( m => m.SearchInternationalHotelPageModule)
  },
  {
    path: 'room-count-children',
    loadChildren: () => import('./room-count-children/room-count-children.module').then( m => m.RoomCountChildrenPageModule)
  },  {
    path: 'select-nationality',
    loadChildren: () => import('./select-nationality/select-nationality.module').then( m => m.SelectNationalityPageModule)
  },
  {
    path: 'inter-hotel-map',
    loadChildren: () => import('./inter-hotel-map/inter-hotel-map.module').then( m => m.InterHotelMapPageModule)
  }

];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelInternationalRoutingModule {}
