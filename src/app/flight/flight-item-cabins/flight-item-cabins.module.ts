import { FlightComponentsModule } from './../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FlightItemCabinsPage } from './flight-item-cabins.page';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: '',
    component: FlightItemCabinsPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightComponentsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [FlightItemCabinsPage]
})
export class FlightItemCabinsPageModule { }
