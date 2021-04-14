import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { FlightComponentsModule } from "src/app/flight/components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

// import { FlightPipesModule } from "../pipes/Pipes.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { ConfirmCredentialInfoGuard } from "src/app/guards/confirm-credential-info.guard";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";
import { StylePageGuard } from "src/app/guards/style-page.guard";
import { FlightBookDfPage } from "./flight-book-df.page";
import { FlightPipesModule } from "../pipes/Pipes.module";

const routes: Routes = [
  {
    path: "",
    component: FlightBookDfPage,
    canActivate: [StylePageGuard, ConfirmCredentialInfoGuard],
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
    MemberPipesModule,
    FlightPipesModule,
    TmcComponentsModule,
    AppComponentsModule,
  ],
  declarations: [FlightBookDfPage],
})
export class FlightBookDfPageModule {}
