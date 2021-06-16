import { AppDirectivesModule } from "../../directives/directives.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { FlightGpComponentsModule } from "../components/components.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";
import { StylePageGuard } from "src/app/guards/style-page.guard";
import { FlightGpListPage } from "./flight-gp-list.page";

const routes: Routes = [
  {
    path: "",
    component: FlightGpListPage,
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
    FlightGpComponentsModule,
    TmcComponentsModule,
    AppDirectivesModule,
  ],
  exports:[

  ],
  declarations: [FlightGpListPage],
})
export class FlightGpListPageModule {}
