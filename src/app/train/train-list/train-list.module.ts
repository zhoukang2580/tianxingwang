import { TmcComponentsModule } from "./../../tmc/components/tmcComponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { TrainListPage } from "./train-list.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";

const routes: Routes = [
  {
    path: "",
    component: TrainListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TmcComponentsModule,
    AppComponentsModule
  ],
  declarations: [TrainListPage]
})
export class TrainListPageModule {}
