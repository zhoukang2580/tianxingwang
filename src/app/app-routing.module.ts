import { NoAuthorizePage } from "./pages/no-authorize/no-authorize.page";
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
import { CarModule } from "./car/car.module";
import { HotelInternationalModule } from "./hotel-international/hotel-international.module";
import { WorkflowModule } from "./workflow/workflow.module";

const routes: Routes = [
  {
    path: "crop-avatar",
    loadChildren: () =>
      import("./pages/crop-avatar/crop-avatar.module").then(
        m => m.CropAvatarPageModule
      )
  },
  {
    path: "function-test",
    loadChildren: () =>
      import("./pages/function-test/function-test.module").then(
        m => m.FunctionTestPageModule
      )
  },
  {
    path: "scan",
    loadChildren: () =>
      import("./pages/scan/scan.module").then(m => m.ScanPageModule)
  },
  {
    path: "open-url",
    loadChildren: () =>
      import("./pages/open-url/open-url.module").then(m => m.OpenUrlPageModule)
  },
  {
    path: "contact-us",
    loadChildren: () =>
      import("./pages/contact-us/contact-us.module").then(
        m => m.ContactUsPageModule
      )
  },
  {
    path: "no-authorize",
    loadChildren: () =>
      import("./pages/no-authorize/no-authorize.module").then(
        m => m.NoAuthorizePageModule
      )
  },
  {
    path: "developer-options",
    loadChildren: () =>
      import("./pages/developer-options/developer-options.module").then(
        m => m.DeveloperOptionsPageModule
      )
  },
  {
    path: "open-my-calendar",
    loadChildren: () =>
      import("./pages/open-my-calendar/open-my-calendar.module").then(
        m => m.OpenMyCalendarPageModule
      )
  },
  {
    path: "",
    component: TabsPage,
    pathMatch: "full"
  },
  {
    path: "**",
    loadChildren: () =>
      import("./page404/page404.module").then(m => m.Page404PageModule)
  },
  {
    path: "workflow-list",
    loadChildren: () =>
      import("./workflow/workflow-list/workflow-list.module").then(
        m => m.WorkflowListPageModule
      )
  },  {
    path: 'member-credential-list',
    loadChildren: () => import('./member/member-credential-list/member-credential-list.module').then( m => m.MemberCredentialListPageModule)
  }

];
@NgModule({
  imports: [
    CarModule,
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
    HotelInternationalModule,
    WorkflowModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      enableTracing: !true,
      useHash: true
    })
  ],
  exports: [RouterModule, MessageModule]
})
export class AppRoutingModule {}
