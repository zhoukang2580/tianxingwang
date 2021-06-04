import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import {AddPassengerInformartionGpPage } from './add-passenger-informartion-gp.page';
import { RouterModule, Routes } from '@angular/router';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: AddPassengerInformartionGpPage,
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
  declarations: [AddPassengerInformartionGpPage]
})
export class AddPassengerInformartionGpPageModule {}
