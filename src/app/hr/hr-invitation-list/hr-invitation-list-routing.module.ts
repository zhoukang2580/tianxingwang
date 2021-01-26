import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { HrInvitationListPage } from './hr-invitation-list.page';

const routes: Routes = [
  {
    path: '',
    component: HrInvitationListPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HrInvitationListPageRoutingModule {}
