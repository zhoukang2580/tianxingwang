import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { HrInvitationSearchPage } from './hr-invitation-search.page';

const routes: Routes = [
  {
    path: '',
    component: HrInvitationSearchPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HrInvitationSearchPageRoutingModule {}
