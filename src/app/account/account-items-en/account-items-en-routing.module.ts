import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { AccountItemsEnPage } from './account-items-en.page';

const routes: Routes = [
  {
    path: '',
    canActivate: [StylePageGuard],
    component: AccountItemsEnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountItemsEnPageRoutingModule {}
