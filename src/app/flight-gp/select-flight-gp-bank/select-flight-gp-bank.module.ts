import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { RouterModule, Routes } from '@angular/router';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { SelectFlightGpBankPage } from './select-flight-gp-bank.page';

const routes: Routes = [
  {
    path: "",
    component: SelectFlightGpBankPage,
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
  declarations: [SelectFlightGpBankPage]
})
export class SelectFlightGpBankPageModule {}


