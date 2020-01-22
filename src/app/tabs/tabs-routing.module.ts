import { AuthorityGuard } from "../guards/authority.guard";
import { NgModule } from "@angular/core";
import { RouterModule, Routes, Router } from "@angular/router";
import { TabsPage } from "./tabs.page";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { AgentGuard } from "../guards/agent.guard";
import { TmcGuard } from "../guards/tmc.guard";
import { ConfirmCredentialInfoGuard } from "../guards/confirm-credential-info.guard";

const routes: Routes = [
  {
    path: "tabs",
    component: TabsPage,
    canActivateChild: [AuthorityGuard, ConfirmCredentialInfoGuard],
    children: [
      {
        path: "",
        redirectTo: "/tabs/home",
        pathMatch: "full"
      },
      {
        path: "home",
        loadChildren: () =>
          import("./tab-home/home.module").then(m => m.HomePageModule)
      },
      {
        path: "my",
        loadChildren: () =>
          import("./tab-my/my.module").then(m => m.MyPageModule)
      },
      {
        path: "trip",

        loadChildren: () =>
          import("./tab-trip/trip.module").then(m => m.TripPageModule)
      }
    ]
  },
  {
    path: "",
    redirectTo: "/tabs/home",
    pathMatch: "full"
  }
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule {
  constructor(router: Router) {
    // console.log("TabsPageRoutingModule", router.config);
  }
}
