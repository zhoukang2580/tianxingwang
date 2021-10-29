import { AuthorityGuard } from "../guards/authority.guard";
import { NgModule } from "@angular/core";
import { RouterModule, Routes, Router } from "@angular/router";
import { TabsPage } from "./tabs.page";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { AgentGuard } from "../guards/agent.guard";
import { TmcGuard } from "../guards/tmc.guard";
import { ConfirmCredentialInfoGuard } from "../guards/confirm-credential-info.guard";
import { AppHelper } from "../appHelper";
import { CONFIG } from "../config";
const routes: Routes = [
  {
    path: "tabs",
    component: TabsPage,
    canActivateChild: [AuthorityGuard],
    children: [
      {
        path: "",
        redirectTo: "/tabs/tmc-home",
        pathMatch: "full",
      },
      {
        path: "tmc-home",
        loadChildren: () =>
          import("./tab-tmc-home/tmc-home.module").then(
            (m) => m.TmcHomePageModule
          ),
      },
      {
        path: "tmc-home_en",
        loadChildren: () =>
          import("./tab-tmc-home_en/tmc-home_en.module").then(
            (m) => m.TmcHomeEnPageModule
          ),
      },
      {
        path: "tmc-home_df",
        loadChildren: () =>
          import("./tab-tmc-home-df/tmc-home-df.module").then(
            (m) => m.TmcHomeDfPageModule
          ),
      },
      {
        path: "my",
        loadChildren: () =>
          import("./tab-my_df/my_df.module").then((m) => m.MyPageDfModule),
      },
      {
        path: "my_en",
        loadChildren: () =>
          import("./tab-my_en/my_en.module").then((m) => m.MyEnPageModule),
      },
      {
        path: "trip",

        loadChildren: () =>
          import("./tab-trip/trip.module").then((m) => m.TripPageModule),
      },
    ],
  },
  {
    path: "",
    redirectTo: "/tabs/tmc-home",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsRoutingModule {
  constructor(router: Router) {
    // console.log("TabsPageRoutingModule", router.config);
  }
}
