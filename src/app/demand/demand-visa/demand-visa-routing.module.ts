import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemandVisaPage } from './demand-visa.page';

const routes: Routes = [
  {
    path: '',
    component: DemandVisaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemandVisaPageRoutingModule {}
