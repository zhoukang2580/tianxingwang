import { AgentGuard } from "./../../guards/agent.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { BookFlightPage } from "./book-flight.page";
import { FlightComponentsModule } from "../components/components.module";
import { DirectivesModule } from "src/app/directives/directives.module";
import { TmcGuard } from "src/app/guards/tmc.guard";

const routes: Routes = [
  {
    path: "",
    component: BookFlightPage,
    canActivate: [TmcGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlightComponentsModule,
    DirectivesModule
  ],
  declarations: [BookFlightPage],
  entryComponents: [BookFlightPage]
})
export class BookFlightPageModule {}
