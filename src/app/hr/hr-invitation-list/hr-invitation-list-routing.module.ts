import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HrInvitationListPage } from './hr-invitation-list.page';

const routes: Routes = [
  {
    path: '',
    component: HrInvitationListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HrInvitationListPageRoutingModule {}
