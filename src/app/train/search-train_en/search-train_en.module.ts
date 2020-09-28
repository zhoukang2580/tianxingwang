import { AppComponentsModule } from "../../components/appcomponents.module";
import { ConfirmCredentialInfoGuard } from "../../guards/confirm-credential-info.guard";
import { CandeactivateGuard } from "../../guards/candeactivate.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AppDirectivesModule } from "src/app/directives/directives.module";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { SearchTrainEnPage } from "./search-train_en.page";
import { TrainComponentsModule } from "../components/traincomponents.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { AuthorityGuard } from "src/app/guards/authority.guard";
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: SearchTrainEnPage,
    canActivate: [AuthorityGuard, TmcGuard, ConfirmCredentialInfoGuard, StylePageGuard],
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
    TrainComponentsModule,
    AppComponentsModule
  ],
  declarations: [SearchTrainEnPage],
  entryComponents: []
})
export class SearchTrainEnPageModule {}
