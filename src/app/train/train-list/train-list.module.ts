import { TmcComponentsModule } from "./../../tmc/components/tmcComponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { TrainListPage } from "./train-list.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { TrainComponentsModule } from "../components/traincomponents.module";
import { AppDirectivesModule } from 'src/app/directives/directives.module';
import { StylePageGuard } from "src/app/guards/style-page.guard";

const routes: Routes = [
  {
    path: "",
    component: TrainListPage,
    canActivate:[StylePageGuard]
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
  declarations: [TrainListPage]
})
export class TrainListPageModule {}
