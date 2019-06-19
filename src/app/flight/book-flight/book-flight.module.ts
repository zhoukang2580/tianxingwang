import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BookFlightPage } from './book-flight.page';
import { ComponentsModule } from '../components/components.module';
import { SelectDatetimePage } from '../select-datetime/select-datetime.page';
import { DirectivesModule } from 'src/app/directives/directives.module';

const routes: Routes = [
  {
    path: '',
    component: BookFlightPage,
  }
];

@NgModule({
  imports: [
  CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    DirectivesModule
  ],
  declarations: [BookFlightPage],
  entryComponents:[BookFlightPage]
})
export class BookFlightPageModule {}
