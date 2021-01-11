import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HotelCityDfPage } from './hotel-city-df.page';

const routes: Routes = [
  {
    path: '',
    component: HotelCityDfPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [HotelCityDfPage]
})
export class HotelCityDfPageModule {}
