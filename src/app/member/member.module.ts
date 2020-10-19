import { AppDirectivesModule } from "./../directives/directives.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
const routes: Routes = [
  {
    path: "member-detail",
    loadChildren: () =>
      import("./member-detail/member-detail.module").then(
        m => m.MemberDetailPageModule
      )
  },
  {
    path: "member-credential-list",
    loadChildren: () =>
      import(
        "./member-credential-list/member-credential-list.module"
      ).then(m => m.MemberCredentialListPageModule)
  },
  {
    path: "member-credential-management",
    loadChildren: () =>
      import(
        "./member-credential-management/member-credential-management.module"
      ).then(m => m.MemberCredentialManagementPageModule)
  },
  {
    path: "member-credential-management_en",
    loadChildren: () =>
      import(
        "./member-credential-management_en/member-credential-management_en.module"
      ).then(m => m.MemberCredentialManagementEnPageModule)
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), AppDirectivesModule],
  exports: [RouterModule]
})
export class MemberModule { }
