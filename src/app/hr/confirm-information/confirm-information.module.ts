import { AppComponentsModule } from './../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ConfirmInformationPage } from './confirm-information.page';
import { MemberPipesModule } from 'src/app/member/pipe/pipe.module';

const routes: Routes = [
  {
    path: '',
    component: ConfirmInformationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberPipesModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [ConfirmInformationPage]
})
export class ConfirmInformationPageModule {}
