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
    path: "agent-order-list",
    loadChildren: () =>
      import("./agent-order-list/agent-order-list.module").then(m => m.AgentOrderListPageModule)
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule {}
