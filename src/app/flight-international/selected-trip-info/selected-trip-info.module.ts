import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectedTripInfoPageRoutingModule } from './selected-trip-info-routing.module';

import { SelectedTripInfoPage } from './selected-trip-info.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { MemberPipesModule } from 'src/app/member/pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    SelectedTripInfoPageRoutingModule,
    MemberPipesModule
  ],
  declarations: [SelectedTripInfoPage]
})
export class SelectedTripInfoPageModule {}
