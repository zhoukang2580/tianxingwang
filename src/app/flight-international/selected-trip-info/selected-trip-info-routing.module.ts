import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectedTripInfoPage } from './selected-trip-info.page';

const routes: Routes = [
  {
    path: '',
    component: SelectedTripInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectedTripInfoPageRoutingModule {}
