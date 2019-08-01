import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
export const routes: Routes = [
  {
    path: "switch-company",
    loadChildren:
      "./switch-company/switch-company.module#SwitchCompanyPageModule"
  },
  {
    path: "comfirm-information",
    loadChildren:
      "./confirm-information/confirm-information.module#ComfirmInformationPageModule"
  },
  {
    path: "product-list",
    loadChildren: "./product-list/product-list.module#ProductListPageModule"
  },
  {
    path: "product-tabs",
    loadChildren: "./product-tabs/product-tabs.module#ProductTabsPageModule"
  },
  { path: 'order-detail', loadChildren: './order-detail/order-detail.module#OrderDetailPageModule' }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TmcRoutingModule {}
