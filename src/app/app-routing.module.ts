import { NoAuthorizePage } from './pages/no-authorize/no-authorize.page';
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
import { TmcModule } from "./tmc/tmc.module";
import { CmsModule } from "./cms/cms.module";
import { MessageModule } from "./message/message.module";
import { OrderModule } from "./order/order.module";
import { HrModule } from "./hr/hr.module";
import { TrainModule } from "./train/train.module";
import { HotelModule } from "./hotel/hotel.module";

const routes: Routes = [
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
    path: "open-url",
    loadChildren: "./pages/open-url/open-url.module#OpenUrlPageModule"
  },
  { path: 'contact-us', loadChildren: './pages/contact-us/contact-us.module#ContactUsPageModule' },
  { path: 'no-authorize', loadChildren: "./pages/no-authorize/no-authorize.module#NoAuthorizePageModule" },
  { path: 'developer-options', loadChildren: './pages/developer-options/developer-options.module#DeveloperOptionsPageModule' },
  {
    path: "",
    component: TabsPage,
    pathMatch: "full"
  },
  {
    path: "**",
    loadChildren: "./page404/page404.module#Page404PageModule",
    // matcher: AppHelper.matchDefaultRoute
  },


];
@NgModule({
  imports: [
    RegisterModule,
    LoginModule,
    FlightModule,
    AccountModule,
    HrModule,
    PasswordModule,
    TabsPageModule,
    MemberModule,
    AgentModule,
    CmsModule,
    TmcModule,
    OrderModule,
    MessageModule,
    TrainModule,
    HotelModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      enableTracing: !true,
      useHash: true
    })
  ],
  exports: [RouterModule, MessageModule]
})
export class AppRoutingModule { }
