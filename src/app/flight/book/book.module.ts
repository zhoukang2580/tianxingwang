import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { FlightComponentsModule } from "src/app/flight/components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { BookPage } from "./book.page";
import { FlightPipesModule } from "../pipes/Pipes.module";
import { TmcComponentsModule } from 'src/app/tmc/components/tmcComponents.module';

const routes: Routes = [
  {
    path: "",
    component: BookPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlightComponentsModule,
    MemberPipesModule,
    FlightPipesModule,
    TmcComponentsModule
  ],
  declarations: [BookPage]
})
export class FlightBookPageModule {}
