import { AppComponentsModule } from './../../components/appcomponents.module';
import { CandeactivateGuard } from "./../../guards/candeactivate.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AuthorityGuard } from "src/app/guards/authority.guard";
import { MemberCredentialManagementPage } from "./member-credential-management.page";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { MemberComponentsModule } from '../components/components.module';

const routes: Routes = [
  {
    path: "",
    component: MemberCredentialManagementPage,
    canActivate: [AuthorityGuard],
    canDeactivate: [CandeactivateGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberPipesModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
    MemberComponentsModule
  ],
  declarations: [MemberCredentialManagementPage]
})
export class MemberCredentialManagementPageModule {}
