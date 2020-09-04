import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApprovalTaskPage } from './approval-task.page';

const routes: Routes = [
  {
    path: '',
    component: ApprovalTaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApprovalTaskPageRoutingModule {}
