import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { SelectInterCityPage } from './select-inter-city.page';

const routes: Routes = [
  {
    path: '',
    component: SelectInterCityPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectInterCityPageRoutingModule {}
