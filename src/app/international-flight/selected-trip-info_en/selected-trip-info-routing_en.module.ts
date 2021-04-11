import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { SelectedTripInfoEnPage } from './selected-trip-info_en.page';

const routes: Routes = [
  {
    path: '',
    component: SelectedTripInfoEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectedTripInfoEnPageRoutingModule {}
