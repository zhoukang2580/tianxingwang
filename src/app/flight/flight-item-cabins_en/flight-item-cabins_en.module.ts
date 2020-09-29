import { StylePageGuard } from './../../guards/style-page.guard';
import { FlightComponentsModule } from './../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FlightItemCabinsEnPage } from './flight-item-cabins_en.page';
import { FlightPipesModule } from '../pipes/Pipes.module';

const routes: Routes = [
  {
    path: '',
    component: FlightItemCabinsEnPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightComponentsModule,
    FlightPipesModule,
    RouterModule.forChild(routes),
  ],
  declarations: [FlightItemCabinsEnPage]
})
export class FlightItemCabinsEnPageModule { }
