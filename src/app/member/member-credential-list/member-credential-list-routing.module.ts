import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { MemberCredentialListPage } from './member-credential-list.page';

const routes: Routes = [
  {
    path: '',
    component: MemberCredentialListPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberCredentialListPageRoutingModule {}
