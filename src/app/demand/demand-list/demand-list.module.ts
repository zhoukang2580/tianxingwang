import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandListPageRoutingModule } from './demand-list-routing.module';

import { DemandListPage } from './demand-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandListPageRoutingModule
  ],
  declarations: [DemandListPage]
})
export class DemandListPageModule {}
