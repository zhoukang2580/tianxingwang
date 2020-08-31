import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApprovalTackPage } from './approval-task.page';

const routes: Routes = [
  {
    path: '',
    component: ApprovalTackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApprovalTackPageRoutingModule {}
