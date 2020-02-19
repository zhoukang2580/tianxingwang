import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkflowListPage } from './workflow-list.page';

const routes: Routes = [
  {
    path: '',
    component: WorkflowListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowListPageRoutingModule {}
