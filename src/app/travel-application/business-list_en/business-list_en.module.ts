import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { BusinessListEnPage } from './business-list_en.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { RouterModule, Routes } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: BusinessListEnPage,
    canActivate: [StylePageGuard]
  },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    IonicModule,
    AppComponentsModule
  ],
  declarations: [BusinessListEnPage]
})
export class BusinessListEnPageModule {}
