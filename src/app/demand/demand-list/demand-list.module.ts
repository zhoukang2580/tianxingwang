import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandListPageRoutingModule } from './demand-list-routing.module';

import { DemandListPage } from './demand-list.page';
import { AppDirectivesModule } from 'src/app/directives/directives.module';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandListPageRoutingModule,
    AppDirectivesModule,
    AppComponentsModule,
    ComponentsModule
  ],
  declarations: [DemandListPage]
})
export class DemandListPageModule {}
