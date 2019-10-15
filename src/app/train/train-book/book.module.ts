import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { TrainComponentsModule } from '../components/traincomponents.module';
import { TrainBookPage } from './book.page';

const routes: Routes = [
  {
    path: "",
    component: TrainBookPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TmcComponentsModule,
    AppComponentsModule,
    TrainComponentsModule
  ],
  declarations: [TrainBookPage]
})
export class TrainBookPageModule {}
