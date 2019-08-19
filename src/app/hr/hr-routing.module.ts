import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Route } from "@angular/router";

let routes: Route[] = [
  {
    path: "hr-invitation",
    loadChildren:
      "./hr-invitation/hr-invitation.module#HrInvitationPageModule"
  },
  {
    path: "confirm-information",
    loadChildren:`./confirm-information/confirm-information.module#ConfirmInformationPageModule`
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrRoutingModule { }
