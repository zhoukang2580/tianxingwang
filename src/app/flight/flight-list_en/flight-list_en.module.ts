import { AppDirectivesModule } from "./../../directives/directives.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { FlightListEnPage } from "./flight-list_en.page";
import { FlightComponentsModule } from "../components/components.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";
import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { FlightListPageModule } from '../flight-list/flight-list.module';

const routes: Routes = [
  {
    path: "",
    component: FlightListEnPage,
    canActivate: [StylePageGuard],
    canDeactivate: [CandeactivateGuard],
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
  declarations: [FlightListEnPage],
})
export class FlightListEnPageModule {}
