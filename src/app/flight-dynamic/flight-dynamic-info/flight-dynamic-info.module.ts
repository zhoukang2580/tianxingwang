import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { TmcGuard } from 'src/app/guards/tmc.guard';
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { RouterModule, Routes } from '@angular/router';
import { FlightDynamicInfoPage } from './flight-dynamic-info.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';


const routes: Routes = [
  {
    path: "",
    component: FlightDynamicInfoPage,
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
  declarations: [FlightDynamicInfoPage]
})
export class FlightDynamicInfoPageModule {}
