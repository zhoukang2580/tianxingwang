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
    path: "order-list",
    loadChildren: () =>
      import("./order-list/order-list.module").then(
        m => m.OrderListPageModule
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
    path: "order-flight-detail",
    loadChildren: () =>
      import("./order-flight-detail/order-flight-detail.module").then(
        m => m.OrderFlightDetailPageModule
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
    path: "order-train-detail",
    loadChildren: () =>
      import('./order-train-detail/order-train-detail.module').then(
        m => m.OrderTrainDetailPageModule
      )
  }

];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
