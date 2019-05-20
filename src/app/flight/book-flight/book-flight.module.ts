import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BookFlightPage } from './book-flight.page';
import { AppComponentsModule } from '../components/components.module';
import { SelectDatetimePage } from '../select-datetime/select-datetime.page';

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
    AppComponentsModule
  ],
  declarations: [BookFlightPage,SelectDatetimePage],
  entryComponents:[BookFlightPage,SelectDatetimePage]
})
export class BookFlightPageModule {}
