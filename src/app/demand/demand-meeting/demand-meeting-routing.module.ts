import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemandMeetingPage } from './demand-meeting.page';

const routes: Routes = [
  {
    path: '',
    component: DemandMeetingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemandMeetingPageRoutingModule {}
