import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { TabTripEnPage } from './tab-trip-en.page';

const routes: Routes = [
  {
    path: '',
    component: TabTripEnPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabTripEnPageRoutingModule {}
