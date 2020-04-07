import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HrInvitationSearchPage } from './hr-invitation-search.page';

const routes: Routes = [
  {
    path: '',
    component: HrInvitationSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HrInvitationSearchPageRoutingModule {}
