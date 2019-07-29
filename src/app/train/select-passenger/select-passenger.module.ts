import { CandeactivateGuard } from './../../guards/candeactivate.guard';
import { AppcomponentsModule } from 'src/app/components/appcomponents.module';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { SelectPassengerPage } from "./select-passenger.page";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { AuthorityGuard } from "src/app/guards/authority.guard";
import { MemberPipesModule } from 'src/app/member/pipe/pipe.module';

const routes: Routes = [
  {
    path: "",
    component: SelectPassengerPage,
    canActivate: [AuthorityGuard, TmcGuard],
    canDeactivate:[CandeactivateGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppcomponentsModule,
    RouterModule.forChild(routes),
    MemberPipesModule
  ],
  declarations: [SelectPassengerPage]
})
export class SelectPassengerPageModule {}
