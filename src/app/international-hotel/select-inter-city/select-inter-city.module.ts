import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectInterCityPageRoutingModule } from './select-inter-city-routing.module';

import { SelectInterCityPage } from './select-inter-city.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectInterCityPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [SelectInterCityPage]
})
export class SelectInterCityPageModule {}
