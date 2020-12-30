import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandVisaPageRoutingModule } from './demand-visa-routing.module';

import { DemandVisaPage } from './demand-visa.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandVisaPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [DemandVisaPage]
})
export class DemandVisaPageModule {}
