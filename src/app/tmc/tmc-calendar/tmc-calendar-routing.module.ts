import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TmcCalendarPage } from './tmc-calendar.page';

const routes: Routes = [
  {
    path: '',
    component: TmcCalendarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TmcCalendarPageRoutingModule {}
