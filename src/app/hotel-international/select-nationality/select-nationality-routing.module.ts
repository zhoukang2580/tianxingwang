import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { SelectNationalityPage } from './select-nationality.page';

const routes: Routes = [
  {
    path: '',
    component: SelectNationalityPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectNationalityPageRoutingModule {}
