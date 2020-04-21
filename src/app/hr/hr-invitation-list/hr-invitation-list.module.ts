import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HrInvitationListPageRoutingModule } from './hr-invitation-list-routing.module';

import { HrInvitationListPage } from './hr-invitation-list.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,    
    HrInvitationListPageRoutingModule
  ],
  declarations: [HrInvitationListPage]
})
export class HrInvitationListPageModule {}
