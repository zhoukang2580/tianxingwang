import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AirportServicesPage } from './airport-services.page';

const routes: Routes = [
  {
    path: '',
    component: AirportServicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AirportServicesPageRoutingModule {}
