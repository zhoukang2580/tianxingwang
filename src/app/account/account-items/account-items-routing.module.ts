import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountItemsPage } from './account-items.page';

const routes: Routes = [
  {
    path: '',
    component: AccountItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountItemsPageRoutingModule {}
