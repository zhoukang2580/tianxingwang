import { AuthorityGuard } from "../guards/authority.guard";
import { NgModule } from "@angular/core";
import { RouterModule, Routes, Router } from "@angular/router";
import { TabsPage } from "./tabs.page";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { AgentGuard } from "../guards/agent.guard";
import { TmcGuard } from '../guards/tmc.guard';

const routes: Routes = [
  {
    path: "tabs",
    component: TabsPage,
    canActivateChild: [AuthorityGuard, AgentGuard,TmcGuard],
    children: [
      {
        path: "",
        redirectTo: "/tabs/home",
        pathMatch: "full"
      },
      {
        path: "home",
        loadChildren: "./tab-home/home.module#HomePageModule"
      },
      {
        path: "my",
        loadChildren: "./tab-my/my.module#MyPageModule"
      },
      {
        path: "trip",

        loadChildren: "./tab-trip/trip.module#TripPageModule"
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
