import { AppComponentsModule } from '../../components/appcomponents.module';
import { AppDirectivesModule } from '../../directives/directives.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ScanResultPage } from './scan-result.page';
import { CandeactivateGuard } from 'src/app/guards/candeactivate.guard';

const routes: Routes = [
  {
    path: '',
    component: ScanResultPage,
    canDeactivate:[CandeactivateGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppDirectivesModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [ScanResultPage]
})
export class ScanResultPageModule { }
