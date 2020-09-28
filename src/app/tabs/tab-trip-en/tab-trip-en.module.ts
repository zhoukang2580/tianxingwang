import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabTripEnPageRoutingModule } from './tab-trip-en-routing.module';

import { TabTripEnPage } from './tab-trip-en.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabTripEnPageRoutingModule
  ],
  declarations: [TabTripEnPage]
})
export class TabTripEnPageModule {}
