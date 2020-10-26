import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { AccountItemsPage } from "./account-items.page";

const routes: Routes = [
  {
    path: "",
    component: AccountItemsPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountItemsPageRoutingModule {}
