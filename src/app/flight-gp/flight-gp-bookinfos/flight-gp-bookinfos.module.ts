import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { RouterModule, Routes } from '@angular/router';
import { TmcComponentsModule } from 'src/app/tmc/components/tmcComponents.module';
import { FlightGpBookinfosPage } from './flight-gp-bookinfos.page';

const routes: Routes = [
  {
    path: "",
    component: FlightGpBookinfosPage,
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
    AppComponentsModule,
    TmcComponentsModule
  ],
  declarations: [FlightGpBookinfosPage]
})
export class FlightGpBookinfosPageModule {}
