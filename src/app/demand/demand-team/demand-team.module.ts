import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandTeamPageRoutingModule } from './demand-team-routing.module';

import { DemandTeamPage } from './demand-team.page';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandTeamPageRoutingModule,
    AppComponentsModule,
  ],
  declarations: [DemandTeamPage]
})
export class DemandTeamPageModule {}
