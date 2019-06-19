import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Route } from "@angular/router";
import { AuthorityGuard } from '../guards/authority.guard';

let routes: Route[] = [
  {
    path: "hr-invitation",
    loadChildren:
      "./hr-invitation/hr-invitation.module#HrInvitationPageModule"
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrRoutingModule { }
