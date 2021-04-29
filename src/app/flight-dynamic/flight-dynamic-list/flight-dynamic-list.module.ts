import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { FlightDynamicListPage } from './flight-dynamic-list.page';
import { Router, RouterModule, Routes } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { TmcGuard } from 'src/app/guards/tmc.guard';
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';
const routes: Routes = [
  {
    path: "",
    component: FlightDynamicListPage,
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
  declarations: [FlightDynamicListPage]
})
export class FlightDynamicListPageModule {}
