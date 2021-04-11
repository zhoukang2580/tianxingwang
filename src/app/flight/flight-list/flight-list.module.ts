import { AppDirectivesModule } from "./../../directives/directives.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { FlightListPage } from "./flight-list.page";
import { FlightComponentsModule } from "../components/components.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";
import { StylePageGuard } from "src/app/guards/style-page.guard";

const routes: Routes = [
  {
    path: "",
    component: FlightListPage,
    canDeactivate: [CandeactivateGuard],
    canActivate:[StylePageGuard]
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlightComponentsModule,
    TmcComponentsModule,
    AppDirectivesModule,
  ],
  exports:[

  ],
  declarations: [FlightListPage],
})
export class FlightListPageModule {}
