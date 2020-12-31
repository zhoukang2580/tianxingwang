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
import { FlightInternationalModule } from "./flight-international/international-flight.module";
import { TravelApplicationModule } from "./travel-application/travel-application.module";
import { LoginEnModule } from "./login_en/login_en.module";
import { RegisterEnPageModule } from './register_en/register_en.page.module';
import { RegisterEnModule } from './register_en/register_en.module';
import { DemandModule } from "./demand/demand.module";

const routes: Routes = [
  {
    path: "crop-avatar",
    loadChildren: () =>
      import("./pages/crop-avatar/crop-avatar.module").then(
        (m) => m.CropAvatarPageModule
      ),
  },
  {
    path: "function-test",
    loadChildren: () =>
      import("./pages/function-test/function-test.module").then(
        (m) => m.FunctionTestPageModule
      ),
  },
  {
    path: "scan-result",
    loadChildren: () =>
      import("./pages/scan-result/scan-result.module").then(
        (m) => m.ScanResultPageModule
      ),
  },
  {
    path: "open-url",
    loadChildren: () =>
      import("./pages/open-url/open-url.module").then(
        (m) => m.OpenUrlPageModule
      ),
  },
  {
    path: "contact-us",
    loadChildren: () =>
      import("./pages/contact-us/contact-us.module").then(
        (m) => m.ContactUsPageModule
      ),
  },
  {
    path: "no-authorize",
    loadChildren: () =>
      import("./pages/no-authorize/no-authorize.module").then(
        (m) => m.NoAuthorizePageModule
      ),
  },
  {
    path: "developer-options",
    loadChildren: () =>
      import("./pages/developer-options/developer-options.module").then(
        (m) => m.DeveloperOptionsPageModule
      ),
  },
  {
    path: "open-my-calendar",
    loadChildren: () =>
      import("./pages/open-my-calendar/open-my-calendar.module").then(
        (m) => m.OpenMyCalendarPageModule
      ),
  },
  {
    path: "workflow-list",
    loadChildren: () =>
      import("./workflow/workflow-list/workflow-list.module").then(
        (m) => m.WorkflowListPageModule
      ),
  },
  {
    path: "member-credential-list",
    loadChildren: () =>
      import(
        "./member/member-credential-list/member-credential-list.module"
      ).then((m) => m.MemberCredentialListPageModule),
  },
  {
    path: "qrscan",
    loadChildren: () =>
      import("./pages/qrscan/qrscan.module").then((m) => m.QrscanPageModule),
  },
  {
    path: "home",
    loadChildren: () =>
      import("./pages/home/home.module").then((m) => m.HomePageModule),
  },
  {
    path: "",
    component: TabsPage,
    pathMatch: "full",
  },
  {
    path: "**",
    loadChildren: () =>
      import("./page404/page404.module").then((m) => m.Page404PageModule),
  },
  
];
@NgModule({
  imports: [
    CarModule,
    RegisterModule,
    RegisterEnModule,
    DemandModule,
    LoginModule,
    LoginEnModule,
    FlightModule,
    FlightInternationalModule,
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
    TravelApplicationModule,
    TrainModule,
    HotelModule,
    HotelInternationalModule,
    WorkflowModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      enableTracing: !true,
      useHash: true,
    }),
  ],
  exports: [RouterModule, MessageModule],
})
export class AppRoutingModule {}
