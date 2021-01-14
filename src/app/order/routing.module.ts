import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
export const routes: Routes = [
  {
    path: "product-list",
    loadChildren: () =>
      import("./product-list/product-list.module").then(
        m => m.ProductListPageModule
      )
  },
  {
    path: "product-list_en",
    loadChildren: () =>
      import("./product-list_en/product-list_en.module").then(
        m => m.ProductListEnPageModule
      )
  },
  {
    path: "order-list",
    loadChildren: () =>
      import("./order-list/order-list.module").then(
        m => m.OrderListPageModule
      )
  },
  {
    path: "order-list_en",
    loadChildren: () =>
      import("./order-list_en/order-list_en.module").then(
        m => m.OrderListEnPageModule
      )
  },
  {
    path: "order-list_df",
    loadChildren: () =>
      import("./order-list_df/order-list_df.module").then(
        m => m.OrderListDfPageModule
      )
  },
  {
    path: "order-car-detail",
    loadChildren: () =>
      import("./order-car-detail/order-car-detail.module").then(
        m => m.OrderCarDetailPageModule
      )
  },
  {
    path: "order-car-detail_df",
    loadChildren: () =>
      import("./order-car-detail_df/order-car-detail_df.module").then(
        m => m.OrderCarDetailDfPageModule
      )
  },
  {
    path: "order-flight-detail",
    loadChildren: () =>
      import("./order-flight-detail/order-flight-detail.module").then(
        m => m.OrderFlightDetailPageModule
      )
  },
  {
    path: "order-flight-detail_en",
    loadChildren: () =>
      import("./order-flight-detail_en/order-flight-detail_en.module").then(
        m => m.OrderFlightDetailEnPageModule
      )
  },
  {
    path: "order-flight-detail_df",
    loadChildren: () =>
      import("./order-flight-detail_df/order-flight-detail_df.module").then(
        m => m.OrderFlightDetailDfPageModule
      )
  },
  {
    path: "order-hotel-detail",
    loadChildren: () =>
      import("./order-hotel-detail/order-hotel-detail.module").then(
        m => m.OrderHotelDetailPageModule
      )
  },
  {
    path: "order-hotel-detail_en",
    loadChildren: () =>
      import("./order-hotel-detail_en/order-hotel-detail_en.module").then(
        m => m.OrderHotelDetailEnPageModule
      )
  }
  ,{
    path: "order-hotel-detail_df",
    loadChildren: () =>
      import("./order-hotel-detail_df/order-hotel-detail_df.module").then(
        m => m.OrderHotelDetailDfPageModule
      )
  },
 {
    path: "order-train-detail",
    loadChildren: () =>
      import('./order-train-detail/order-train-detail.module').then(
        m => m.OrderTrainDetailPageModule
      )
  },
  {
     path: "order-train-detail_en",
     loadChildren: () =>
       import('./order-train-detail_en/order-train-detail_en.module').then(
         m => m.OrderTrainDetailEnPageModule
       )
   },
  {
     path: "order-train-detail_df",
     loadChildren: () =>
       import('./order-train-detail_df/order-train-detail_df.module').then(
         m => m.OrderTrainDetailDfPageModule
       )
   }

];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
