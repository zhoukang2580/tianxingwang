import { AppComponentsModule } from './../../components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchByTextPageRoutingModule } from './search-by-text-routing.module';

import { SearchByTextPage } from './search-by-text.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchByTextPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [SearchByTextPage]
})
export class SearchByTextPageModule {}
