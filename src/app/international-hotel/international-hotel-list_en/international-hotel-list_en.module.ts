import { HotelInternationalComponentsModule } from '../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InternationalHotelListEnPage } from './international-hotel-list_en.page';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: '',
    component: InternationalHotelListEnPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HotelInternationalComponentsModule,
  ],
  declarations: [InternationalHotelListEnPage]
})
export class InternationalHotelListEnPageModule {}
