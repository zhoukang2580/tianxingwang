import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { DirectivesModule } from "../flight/directives/directives.module";
const routes: Routes = [
  {
    path: "member-detail",
    loadChildren: "./member-detail/member-detail.module#MemberDetailPageModule"
  },
  {
    path: "member-credential-management",
    loadChildren:
      "./member-credential-management/member-credential-management.module#MemberCredentialManagementPageModule"
  },
  {
    path: "member-credential-management-save",
    loadChildren:
      "./member-credential-management-save/member-credential-management-save.module#MemberCredentialManagementSavePageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), DirectivesModule],
  exports: [RouterModule]
})
export class MemberModule {}
