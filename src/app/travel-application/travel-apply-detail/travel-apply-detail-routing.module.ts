import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TravelApplyDetailPage } from './travel-apply-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TravelApplyDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelApplyDetailPageRoutingModule {}
