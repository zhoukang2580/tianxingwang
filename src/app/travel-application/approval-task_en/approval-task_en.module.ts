import { routes } from '../../hotel/hotel-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApprovalTaskEnPageRoutingModule } from './approval-task-routing_en.module';

import { ApprovalTaskEnPage } from './approval-task_en.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApprovalTaskEnPageRoutingModule,
    AppComponentsModule,
  ],
  declarations: [ApprovalTaskEnPage]
})
export class ApprovalTaskEnPageModule {
  
}
