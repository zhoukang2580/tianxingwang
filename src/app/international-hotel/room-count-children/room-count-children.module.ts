import { AppComponentsModule } from '../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoomCountChildrenPageRoutingModule } from './room-count-children-routing.module';

import { RoomCountChildrenPage } from './room-count-children.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoomCountChildrenPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [RoomCountChildrenPage]
})
export class RoomCountChildrenPageModule {}
