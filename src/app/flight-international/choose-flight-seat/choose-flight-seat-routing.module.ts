import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChooseFlightSeatPage } from './choose-flight-seat.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseFlightSeatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseFlightSeatPageRoutingModule {}
