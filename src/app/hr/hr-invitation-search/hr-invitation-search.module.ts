import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HrInvitationSearchPageRoutingModule } from './hr-invitation-search-routing.module';

import { HrInvitationSearchPage } from './hr-invitation-search.page';

import { AppModule } from 'src/app/app.module';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    HrInvitationSearchPageRoutingModule
  ],
  declarations: [HrInvitationSearchPage]
})
export class HrInvitationSearchPageModule {}
