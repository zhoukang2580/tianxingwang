import { TmcComponentsModule } from '../../tmc/components/tmcComponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterHotelBookDfPageRoutingModule } from './inter-hotel-book-df-routing.module';

import { InterHotelBookDfPage } from './inter-hotel-book-df.page';
import { HotelInternationalComponentsModule } from '../components/components.module';
import { MemberPipesModule } from 'src/app/member/pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterHotelBookDfPageRoutingModule,
    TmcComponentsModule,
    HotelInternationalComponentsModule,
    MemberPipesModule
  ],
  declarations: [InterHotelBookDfPage]
})
export class InterHotelBookDfPageModule {}
