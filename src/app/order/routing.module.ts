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
    path: "product-tabs",
    loadChildren: () =>
      import("./product-tabs/product-tabs.module").then(
        m => m.ProductTabsPageModule
      )
  },
  {
    path: "order-detail",
    loadChildren: () =>
      import("./order-detail/order-detail.module").then(
        m => m.OrderDetailPageModule
      )
  },
  {
    path: "car-order-detail",
    loadChildren: () =>
      import("./car-order-detail/car-order-detail.module").then(
        m => m.CarOrderDetailPageModule
      )
  },
  {
    path: "flight-order-detail",
    loadChildren: () =>
      import("./flight-order-detail/flight-order-detail.module").then(
        m => m.FlightOrderDetailPageModule
      )
  },
  {
    path: "hotel-order-detail",
    loadChildren: () =>
      import("./hotel-order-detail/hotel-order-detail.module").then(
        m => m.HotelOrderDetailPageModule
      )
  },
 {
    path: "train-order-detail",
    loadChildren: () =>
      import("./train-order-detail/train-order-detail.module").then(
        m => m.TrainOrderDetailPageModule
      )
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
