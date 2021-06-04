import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { UpdatePassengerInformartionGpPage } from './update-passenger-informartion-gp.page';

const routes: Routes = [
  {
    path: '',
    component: UpdatePassengerInformartionGpPage,
    canDeactivate: [CandeactivateGuard],
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  
  declarations: [UpdatePassengerInformartionGpPage]
})
export class UpdatePassengerInformartionGpPageModule {}
