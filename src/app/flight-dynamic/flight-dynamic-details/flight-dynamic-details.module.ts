import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { FlightDynamicDetailsPage } from './flight-dynamic-details.page';
import { RouterModule, Routes } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { TmcGuard } from 'src/app/guards/tmc.guard';
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
const routes: Routes = [
  {
    path: "",
    component: FlightDynamicDetailsPage,
    canActivate: [
      StylePageGuard,
      AuthorityGuard,
      TmcGuard,
      ConfirmCredentialInfoGuard,
    ],
    canDeactivate: [CandeactivateGuard],
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
  declarations: [FlightDynamicDetailsPage]
})
export class FlightDynamicDetailsPageModule {}
