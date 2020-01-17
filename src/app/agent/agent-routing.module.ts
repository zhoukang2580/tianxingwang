import { Routes } from "@angular/router";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
const routes: Routes = [
  {
    path: "select-customer",
    loadChildren:
      "./select-customer/select-customer.module#SelectCustomerPageModule"
  },  { path: 'order-list', loadChildren: './order-list/order-list.module#OrderListPageModule' },


];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule {}
