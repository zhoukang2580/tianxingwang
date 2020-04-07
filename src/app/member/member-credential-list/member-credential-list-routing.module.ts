import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemberCredentialListPage } from './member-credential-list.page';

const routes: Routes = [
  {
    path: '',
    component: MemberCredentialListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberCredentialListPageRoutingModule {}
