import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenMyCalendarPage } from './open-my-calendar.page';

const routes: Routes = [
  {
    path: '',
    component: OpenMyCalendarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenMyCalendarPageRoutingModule {}
