import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandMeetingPageRoutingModule } from './demand-meeting-routing.module';

import { DemandMeetingPage } from './demand-meeting.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandMeetingPageRoutingModule
  ],
  declarations: [DemandMeetingPage]
})
export class DemandMeetingPageModule {}
