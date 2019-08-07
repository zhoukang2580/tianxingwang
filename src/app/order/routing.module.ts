import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
export const routes: Routes = [
  {
    path: "product-list",
    loadChildren: "./product-list/product-list.module#ProductListPageModule"
  },
  {
    path: "product-tabs",
    loadChildren: "./product-tabs/product-tabs.module#ProductTabsPageModule"
  },
  {
    path: "order-detail",
    loadChildren: "./order-detail/order-detail.module#OrderDetailPageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
