import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { FlightBookinfosGpPage } from './flight-bookinfos-gp.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "",
    component: FlightBookinfosGpPage,
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
  declarations: [FlightBookinfosGpPage]
})
export class FlightBookinfosGpPageModule {}
