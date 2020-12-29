import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckoutSuccessPageRoutingModule } from './checkout-success-routing.module';

import { CheckoutSuccessPage } from './checkout-success.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckoutSuccessPageRoutingModule,
    AppComponentsModule,
  ],
  declarations: [CheckoutSuccessPage]
})
export class CheckoutSuccessPageModule {}
