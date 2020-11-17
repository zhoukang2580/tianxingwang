import { HotelInternationalComponentsModule } from './../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InternationalHotelListPage } from './international-hotel-list.page';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [StylePageGuard],
    component: InternationalHotelListPage
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
  declarations: [InternationalHotelListPage]
})
export class InternationalHotelListPageModule {}
