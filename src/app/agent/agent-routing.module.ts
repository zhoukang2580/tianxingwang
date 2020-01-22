import { Routes } from "@angular/router";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
const routes: Routes = [
  {
    path: "select-customer",
    loadChildren: () =>
      import("./select-customer/select-customer.module").then(
        m => m.SelectCustomerPageModule
      )
  },
  {
    path: "order-list",
    loadChildren: () =>
      import("./order-list/order-list.module").then(m => m.OrderListPageModule)
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule {}
