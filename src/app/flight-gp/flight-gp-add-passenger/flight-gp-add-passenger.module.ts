import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule, Routes } from '@angular/router';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { FlightGpAddPassengerPage } from './flight-gp-add-passenger.page';

const routes: Routes = [
  {
    path: "",
    component: FlightGpAddPassengerPage,
    canDeactivate: [CandeactivateGuard],
    canActivate:[StylePageGuard]
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [FlightGpAddPassengerPage]
})
export class FlightGpAddPassengerPageModule {}
