import { ConfirmCredentialInfoGuard } from './../../guards/confirm-credential-info.guard';
import { CandeactivateGuard } from './../../guards/candeactivate.guard';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AppDirectivesModule } from "src/app/directives/directives.module";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { SearchTrainPage } from "./search-train.page";
import { TrainComponentsModule } from "../components/traincomponents.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";

const routes: Routes = [
  {
    path: "",
    component: SearchTrainPage,
    canActivate: [TmcGuard,ConfirmCredentialInfoGuard],
    canDeactivate: [CandeactivateGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppDirectivesModule,
    TmcComponentsModule,
    TrainComponentsModule
  ],
  declarations: [SearchTrainPage],
  entryComponents: []
})
export class SearchTrainPageModule {}
