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
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
