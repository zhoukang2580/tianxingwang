import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { SelectPassengerGpPage } from './select-passenger-gp.page';
import { RouterModule, Routes } from '@angular/router';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
// const routes: Routes = [
//   {
//     path: "",
//     component: PassengerInformartionGpPage,
//     canDeactivate: [CandeactivateGuard],
//     canActivate:[StylePageGuard]
//   },
// ];

const routes: Routes = [
  {
    path:"",
    component:SelectPassengerGpPage,
    canDeactivate:[CandeactivateGuard],
    canActivate:[StylePageGuard]
  }
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [SelectPassengerGpPage]
})
export class SelectPassengerGpPageModule {}
