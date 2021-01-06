import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckoutSuccessPage } from './checkout-success.page';

const routes: Routes = [
  {
    path: '',
    component: CheckoutSuccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutSuccessPageRoutingModule {}
