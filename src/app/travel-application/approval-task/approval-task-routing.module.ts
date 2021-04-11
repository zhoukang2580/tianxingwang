import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { ApprovalTaskPage } from './approval-task.page';

const routes: Routes = [
  {
    path: '',
    component: ApprovalTaskPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApprovalTaskPageRoutingModule {}
