import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { TmcComponentsModule } from "./../../tmc/components/tmcComponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { TrainListEnPage } from "./train-list_en.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { TrainComponentsModule } from "../components/traincomponents.module";
import { AppDirectivesModule } from 'src/app/directives/directives.module';

const routes: Routes = [
  {
    path: "",
    component: TrainListEnPage,
    canActivate: [StylePageGuard]
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
    TrainComponentsModule,
    AppDirectivesModule
  ],
  declarations: [TrainListEnPage]
})
export class TrainListEnPageModule {}
