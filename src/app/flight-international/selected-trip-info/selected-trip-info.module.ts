import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectedTripInfoPageRoutingModule } from './selected-trip-info-routing.module';

import { SelectedTripInfoPage } from './selected-trip-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectedTripInfoPageRoutingModule
  ],
  declarations: [SelectedTripInfoPage]
})
export class SelectedTripInfoPageModule {}
