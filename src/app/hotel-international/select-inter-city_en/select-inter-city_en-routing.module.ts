import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectInterCityEnPage } from './select-inter-city_en.page';

const routes: Routes = [
  {
    path: '',
    component: SelectInterCityEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectInterCityPageRoutingModule {}
