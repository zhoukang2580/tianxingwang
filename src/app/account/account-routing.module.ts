import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Route } from "@angular/router";
import { AuthorityGuard } from '../guards/authority.guard';

let routes: Route[] = [
  {
    path: "account-setting",
    loadChildren:
      "./account-setting/account-setting.module#AccountSettingPageModule"
  },
  {
    path: "account-security",
    loadChildren:
      "./account-security/account-security.module#AccountSecurityPageModule"
  },
  // {
  //   path: "account-security_en",
  //   loadChildren:
  //     "./account-security/en/account-security-en.module#AccountSecurityEnPageModule"
  // },
  {
    path: "login-device-management",
    loadChildren:
      "./account-device/account-device.module#AccountDevicePageModule"
  },
  {
    path: "account-dingtalk",
    loadChildren:
      "./account-dingtalk/account-dingtalk.module#AccountDingtalkPageModule"
  },
  {
    path: "account-wechat",
    loadChildren:
      "./account-wechat/account-wechat.module#AccountWechatPageModule"
  },
  {
    path: "account-email",
    loadChildren: "./account-email/account-email.module#AccountEmailPageModule"
  },
  {
    path: "account-password",
    loadChildren:
      "./account-password/account-password.module#AccountPasswordPageModule"
  },
  {
    path: "account-pay-password",
    loadChildren:
      "./account-pay-password/account-pay-password.module#AccountPayPasswordPageModule"
  },
  {
    path: "account-bind",
    loadChildren: "./account-bind/account-bind.page.module#AccountBindPageModule"
  },  { path: 'account-mobile', loadChildren: './account-mobile/account-mobile.module#AccountMobilePageModule' }

];
(() => {
  routes = routes.map(r => {
    if (r.loadChildren) {
      return {
        ...r,
        canLoad: [AuthorityGuard]
      }
    }
    if (r.component) {
      return {
        ...r,
        canActivate: [AuthorityGuard]
      }
    }
    return r;
  });
})()
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
