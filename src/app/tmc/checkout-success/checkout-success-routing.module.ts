import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { CheckoutSuccessPage } from './checkout-success.page';

const routes: Routes = [
  {
    path: '',
    component: CheckoutSuccessPage,
    canActivate: [StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutSuccessPageRoutingModule {}
