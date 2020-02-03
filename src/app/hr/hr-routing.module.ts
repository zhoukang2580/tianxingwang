import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Route } from "@angular/router";

let routes: Route[] = [
  {
    path: "hr-invitation",
    loadChildren: () =>
      import("./hr-invitation/hr-invitation.module").then(
        m => m.HrInvitationPageModule
      )
  },
  {
    path: "confirm-information",
    loadChildren: () =>
      import("./confirm-information/confirm-information.module").then(
        m => m.ConfirmInformationPageModule
      )
  },
  {
    path: "hr",
    loadChildren: () => import("./hr/hr.module").then(m => m.HrPageModule)
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrRoutingModule {}
