import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddApplyPage } from './add-apply.page';

const routes: Routes = [
  {
    path: '',
    component: AddApplyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddApplyPageRoutingModule {}
