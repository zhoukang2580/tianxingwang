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
  {
    path: "plane",
    outlet: "products",
    loadChildren:
      "./product-tab-plane/product-tab-plane.module#ProductTabPlanePageModule"
  },
  {
    path: "hotel",
    outlet: "products",
    loadChildren:
      "./product-tab-hotel/product-tab-hotel.module#ProductTabHotelPageModule"
  },
  {
    path: "insurance",
    outlet: "products",
    loadChildren:
      "./product-tab-insurance/product-tab-insurance.module#ProductTabInsurancePageModule"
  },
  {
    path: "train",
    outlet: "products",
    loadChildren:
      "./product-tab-train/product-tab-train.module#ProductTabTrainPageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TmcRoutingModule {}
