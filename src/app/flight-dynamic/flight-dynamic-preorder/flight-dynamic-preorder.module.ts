import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { FlightDynamicPreorderPage } from './flight-dynamic-preorder.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { RouterModule, Routes } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';

const routes: Routes = [
  {
    path: "",
    component: FlightDynamicPreorderPage,
    canActivate: [
      StylePageGuard,
      AuthorityGuard,
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
  declarations: [FlightDynamicPreorderPage]
})
export class FlightDynamicPreorderPageModule {}
