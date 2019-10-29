import { SearchFlightPage } from "./../search-flight/search-flight.page";
import { AgentGuard } from "../../guards/agent.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { FlightComponentsModule } from "../components/components.module";
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { FlightDirectivesModule } from "../directives/directives.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';

const routes: Routes = [
  {
    path: "",
    component: SearchFlightPage,
    canActivate: [TmcGuard,ConfirmCredentialInfoGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlightComponentsModule,
    FlightDirectivesModule,
    AppDirectivesModule,
    TmcComponentsModule
  ],
  declarations: [SearchFlightPage],
  entryComponents: []
})
export class SearchFlightPageModule {}
