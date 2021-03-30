import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectedTripInfoEnPageRoutingModule } from './selected-trip-info-routing_en.module';

import { SelectedTripInfoEnPage } from './selected-trip-info_en.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { MemberPipesModule } from 'src/app/member/pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    SelectedTripInfoEnPageRoutingModule,
    MemberPipesModule
  ],
  declarations: [SelectedTripInfoEnPage]
})
export class SelectedTripInfoEnPageModule {}
