import { StylePageGuard } from './../../guards/style-page.guard';
import { AppComponentsModule } from '../../components/appcomponents.module';
import { CandeactivateGuard } from "../../guards/candeactivate.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AuthorityGuard } from "src/app/guards/authority.guard";
import { MemberCredentialManagementEnPage } from "./member-credential-management_en.page";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { MemberComponentsModule } from '../components/components.module';

const routes: Routes = [
  {
    path: "",
    component: MemberCredentialManagementEnPage,
    canActivate: [AuthorityGuard, StylePageGuard],
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
  declarations: [MemberCredentialManagementEnPage]
})
export class MemberCredentialManagementEnPageModule {}
