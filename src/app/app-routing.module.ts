import { AppHelper } from "src/app/appHelper";
import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { LoginModule } from "./login/login.module";
import { FlightModule } from "./flight/flight.module";
import { AccountModule } from "./account/account.module";
import { TabsPage } from "./tabs/tabs.page";
import { TabsPageModule } from "./tabs/tabs.page.module";
import { PasswordModule } from "./password/password.module";
import { MemberModule } from "./member/member.module";
import { RegisterModule } from "./register/register.module";
import { AgentModule } from "./agent/agent.module";
import { BulletinModule } from "./bulletin/bulletin.module";
import { TmcModule } from './tmc/tmc.module';

const routes: Routes = [
  {
    path: "select-city",
    loadChildren: "./pages/select-city/select-city.module#SelectCityPageModule"
  },
  {
    path: "crop-avatar",
    loadChildren: "./pages/crop-avatar/crop-avatar.module#CropAvatarPageModule"
  },
  {
    path: "function-test",
    loadChildren:
      "./pages/function-test/function-test.module#FunctionTestPageModule"
  },
  { path: "scan", loadChildren: "./pages/scan/scan.module#ScanPageModule" },


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
    RegisterModule,
    LoginModule,
    FlightModule,
    AccountModule,
    PasswordModule,
    TabsPageModule,
    MemberModule,
    AgentModule,
    BulletinModule,
    TmcModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      enableTracing: !true,
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
