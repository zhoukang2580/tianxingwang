import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FlightDirectivesModule } from "../flight/directives/directives.module";
const routes: Routes = [
  {
    path: "member-detail",
    loadChildren: "./member-detail/member-detail.module#MemberDetailPageModule"
  },
  {
    path: "member-credential-management",
    loadChildren:
      "./member-credential-management/member-credential-management.module#MemberCredentialManagementPageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), FlightDirectivesModule],
  exports: [RouterModule]
})
export class MemberModule {}
