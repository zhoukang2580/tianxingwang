import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TmcCalendarComponent } from './tmc-calendar.page';

const routes: Routes = [
  {
    path: '',
    component: TmcCalendarComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TmcCalendarPageRoutingModule {}
