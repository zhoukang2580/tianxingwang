import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectNationalityPage } from './select-nationality.page';

const routes: Routes = [
  {
    path: '',
    component: SelectNationalityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectNationalityPageRoutingModule {}
