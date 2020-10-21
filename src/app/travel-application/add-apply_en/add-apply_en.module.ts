import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddApplyEnPageRoutingModule } from './add-apply-routing_en.module';

import { AddApplyEnPage } from './add-apply_en.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { TravelApplicationComponentsModule } from '../components/travel-application.module';
import { PageComponentsModule } from 'src/app/pages/components/page-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddApplyEnPageRoutingModule,
    AppComponentsModule,
    TravelApplicationComponentsModule,
    PageComponentsModule
  ],
  declarations: [AddApplyEnPage]
})
export class AddApplyEnPageModule {}
export class SharedModule{}
