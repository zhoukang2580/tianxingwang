import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { TravelApplyDetailPage } from './travel-apply-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TravelApplyDetailPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelApplyDetailPageRoutingModule {}
