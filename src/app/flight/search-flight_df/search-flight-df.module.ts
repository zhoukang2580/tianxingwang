import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { CandeactivateGuard } from '../../guards/candeactivate.guard';
import { SearchFlightDfPage } from './search-flight-df.page';
import { AgentGuard } from "../../guards/agent.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { FlightComponentsModule } from "../components/components.module";
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: SearchFlightDfPage,
    canActivate: [AuthorityGuard,TmcGuard,ConfirmCredentialInfoGuard,StylePageGuard],
    canDeactivate:[CandeactivateGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlightComponentsModule,
    AppDirectivesModule,
    TmcComponentsModule
  ],
  declarations: [SearchFlightDfPage],
  entryComponents: []
})
export class SearchFlightDfPageModule {}
