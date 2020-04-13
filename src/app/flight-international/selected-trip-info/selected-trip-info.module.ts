import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectedTripInfoPageRoutingModule } from './selected-trip-info-routing.module';

import { SelectedTripInfoPage } from './selected-trip-info.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    SelectedTripInfoPageRoutingModule
  ],
  declarations: [SelectedTripInfoPage]
})
export class SelectedTripInfoPageModule {}
