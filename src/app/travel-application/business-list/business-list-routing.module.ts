import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { BusinessListPage } from './business-list.page';

const routes: Routes = [
  {
    path: '',
    component: BusinessListPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessListPageRoutingModule {}
