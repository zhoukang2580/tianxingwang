import { CandeactivateGuard } from "../../guards/candeactivate.guard";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { SelectPassengerPage } from "./select-passenger.page";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { AuthorityGuard } from "src/app/guards/authority.guard";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { MemberComponentsModule } from 'src/app/member/components/components.module';
import { StylePageGuard } from "src/app/guards/style-page.guard";

const routes: Routes = [
  {
    path: "",
    component: SelectPassengerPage,
    canActivate: [AuthorityGuard, TmcGuard,StylePageGuard],
    canDeactivate: [CandeactivateGuard],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    MemberComponentsModule,
    RouterModule.forChild(routes),
    MemberPipesModule,
  ],
  declarations: [SelectPassengerPage],
  entryComponents: [SelectPassengerPage],
})
export class SelectPassengerPageModule {}
