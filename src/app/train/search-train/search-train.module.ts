import { AgentGuard } from "../../guards/agent.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { DirectivesModule } from "src/app/directives/directives.module";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { SearchTrainPage } from "./search-train.page";
import { TrainComponentsModule } from "../components/traincomponents.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";

const routes: Routes = [
  {
    path: "",
    component: SearchTrainPage,
    canActivate: [TmcGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    DirectivesModule,
    TmcComponentsModule,
    TrainComponentsModule
  ],
  declarations: [SearchTrainPage],
  entryComponents: []
})
export class SearchTrainPageModule {}
