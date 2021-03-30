import { AppComponentsModule } from '../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectNationalityPageRoutingModule } from './select-nationality-routing.module';

import { SelectNationalityPage } from './select-nationality.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectNationalityPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [SelectNationalityPage]
})
export class SelectNationalityPageModule { }
