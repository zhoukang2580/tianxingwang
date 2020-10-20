import { StylePageGuard } from './../../guards/style-page.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TravelApplyDetailEnPage } from './travel-apply-detail_en.page';

const routes: Routes = [
  {
    path: '',
    component: TravelApplyDetailEnPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelApplyDetailPageRoutingModule {}
