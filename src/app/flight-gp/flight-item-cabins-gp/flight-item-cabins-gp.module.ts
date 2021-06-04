import { FlightGpComponentsModule } from '../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { FlightItemCabinsGpPage } from './flight-item-cabins-gp.page';

const routes: Routes = [
  {
    path: '',
    component: FlightItemCabinsGpPage,
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
  declarations: [FlightItemCabinsGpPage]
})
export class FlightItemCabinsGpPageModule { }
