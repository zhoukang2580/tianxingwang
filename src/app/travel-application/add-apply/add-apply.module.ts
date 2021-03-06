import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddApplyPageRoutingModule } from './add-apply-routing.module';

import { AddApplyPage } from './add-apply.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { TravelApplicationComponentsModule } from '../components/travel-application.module';
import { PageComponentsModule } from 'src/app/pages/components/page-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddApplyPageRoutingModule,
    AppComponentsModule,
    TravelApplicationComponentsModule,
    PageComponentsModule
  ],
  declarations: [AddApplyPage]
})
export class AddApplyPageModule {}
export class SharedModule{}
