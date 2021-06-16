import { FlightGpComponentsModule } from '../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { FlightGpItemCabinsPage } from './flight-gp-item-cabins.page';

const routes: Routes = [
  {
    path: '',
    component: FlightGpItemCabinsPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightGpComponentsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [FlightGpItemCabinsPage]
})
export class FlightGpItemCabinsPageModule { }
