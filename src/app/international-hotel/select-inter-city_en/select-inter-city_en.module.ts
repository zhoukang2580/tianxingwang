import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectInterCityPageRoutingModule } from './select-inter-city_en-routing.module';

import { SelectInterCityEnPage } from './select-inter-city_en.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectInterCityPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [SelectInterCityEnPage]
})
export class SelectInterCityEnPageModule {}
