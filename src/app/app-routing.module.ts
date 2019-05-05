import { AppHelper } from "src/app/appHelper";
import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthorityGuard } from "./guards/authority.guard";
import { LoginModule } from "./login/login.module";
import { FlightModule } from "./flight/flight.module";
import { AccountModule } from "./account/account.module";
import { TabsPage } from "./tabs/tabs.page";
import { TabsPageModule } from './tabs/tabs.page.module';

const routes: Routes = [
  {
    path: "guard-page",
    loadChildren: "./pages/guardpage/guardpage.module#GuardpagePageModule",
    canActivate: [AuthorityGuard]
  },
  {
    path: "",
    component: TabsPage,
    pathMatch: "full"
  },
  {
    loadChildren: "./page404/page404.module#Page404PageModule",
    matcher: AppHelper.matchDefaultRoute
  }
];
@NgModule({
  imports: [
    LoginModule,
    FlightModule,
    AccountModule,
    TabsPageModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      enableTracing: !true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
