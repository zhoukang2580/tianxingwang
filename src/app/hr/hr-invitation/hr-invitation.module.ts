import { AppComponentsModule } from "./../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { HrInvitationPage } from "./hr-invitation.page";
import { AuthorityGuard } from "src/app/guards/authority.guard";

const routes: Routes = [
  {
    path: "",
    component: HrInvitationPage,
    canActivate: [AuthorityGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [HrInvitationPage]
})
export class HrInvitationPageModule {}
