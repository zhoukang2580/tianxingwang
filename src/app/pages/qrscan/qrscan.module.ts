import { AppComponentsModule } from '../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrscanPageRoutingModule } from './qrscan-routing.module';

import { QrScanPage } from './qrscan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrscanPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [QrScanPage],
  providers: []
})
export class QrscanPageModule { }

