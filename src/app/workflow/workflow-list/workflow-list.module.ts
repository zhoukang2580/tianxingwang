import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkflowListPageRoutingModule } from './workflow-list-routing.module';

import { WorkflowListPage } from './workflow-list.page';
import { WorkflowComponentsModule } from '../components/workflow-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkflowListPageRoutingModule,
    WorkflowComponentsModule
  ],
  declarations: [WorkflowListPage]
})
export class WorkflowListPageModule {}
