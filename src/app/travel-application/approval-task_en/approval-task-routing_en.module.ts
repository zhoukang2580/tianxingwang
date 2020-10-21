import { StylePageGuard } from './../../guards/style-page.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApprovalTaskEnPage } from './approval-task_en.page';

const routes: Routes = [
  {
    path: '',
    component: ApprovalTaskEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApprovalTaskEnPageRoutingModule {}
