import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectInterCityPage } from './select-inter-city.page';

const routes: Routes = [
  {
    path: '',
    component: SelectInterCityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectInterCityPageRoutingModule {}
