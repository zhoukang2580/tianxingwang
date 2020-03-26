import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchInternationalFlightPage } from './search-international-flight.page';

const routes: Routes = [
  {
    path: '',
    component: SearchInternationalFlightPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchInternationalFlightPageRoutingModule {}
