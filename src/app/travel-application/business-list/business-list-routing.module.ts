import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusinessListPage } from './business-list.page';

const routes: Routes = [
  {
    path: '',
    component: BusinessListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessListPageRoutingModule {}
