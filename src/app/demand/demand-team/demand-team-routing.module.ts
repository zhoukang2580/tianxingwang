import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemandTeamPage } from './demand-team.page';

const routes: Routes = [
  {
    path: '',
    component: DemandTeamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemandTeamPageRoutingModule {}
