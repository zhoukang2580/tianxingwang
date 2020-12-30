import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemandCarPage } from './demand-car.page';

const routes: Routes = [
  {
    path: '',
    component: DemandCarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemandCarPageRoutingModule {}
