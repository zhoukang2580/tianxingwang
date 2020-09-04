import { routes } from '../../hotel/hotel-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApprovalTaskPageRoutingModule } from './approval-task-routing.module';

import { ApprovalTaskPage } from './approval-task.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApprovalTaskPageRoutingModule,
    AppComponentsModule,
  ],
  declarations: [ApprovalTaskPage]
})
export class ApprovalTaskPageModule {
  
}
