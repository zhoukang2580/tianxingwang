import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Route } from "@angular/router";
import { AuthorityGuard } from "../guards/authority.guard";

let routes: Route[] = [
  {
    path: "account-setting",
    loadChildren: () =>
      import("./account-setting/account-setting.module").then(
        m => m.AccountSettingPageModule
      )
  },
  {
    path: "account-setting_en",
    loadChildren: () =>
      import("./account-setting-en/account-setting-en.module").then(
        m => m.AccountSettingEnPageModule
      )
  },
  {
    path: "account-security",
    loadChildren: () =>
      import("./account-security/account-security.module").then(
        m => m.AccountSecurityPageModule
      )
  },
  {
    path: "account-security_en",
    loadChildren: () =>
      import("./account-security-en/account-security-en.module").then(
        m => m.AccountSecurityEnPageModule
      )
  },
  {
    path: "account-device",
    loadChildren: () =>
      import("./account-device/account-device.module").then(
        m => m.AccountDevicePageModule
      )
  },
  {
    path: "account-dingtalk",
    loadChildren: () =>
      import("./account-dingtalk/account-dingtalk.module").then(
        m => m.AccountDingtalkPageModule
      )
  },
  {
    path: "account-wechat",
    loadChildren: () =>
      import("./account-wechat/account-wechat.module").then(
        m => m.AccountWechatPageModule
      )
  },
  {
    path: "account-email",
    loadChildren: () =>
      import("./account-email/account-email.module").then(
        m => m.AccountEmailPageModule
      )
  },
  {
    path: "account-email_en",
    loadChildren: () =>
      import("./account-email-en/account-email-en.module").then(
        m => m.AccountEmailEnPageModule
      )
  },
  {
    path: "account-password",
    loadChildren: () =>
      import("./account-password/account-password.module").then(
        m => m.AccountPasswordPageModule
      )
  },
  {
    path: "account-password_en",
    loadChildren: () =>
      import("./account-password-en/account-password-en.module").then(
        m => m.AccountPasswordEnPageModule
      )
  },
  {
    path: "account-pay-password",
    loadChildren: () =>
      import("./account-pay-password/account-pay-password.module").then(
        m => m.AccountPayPasswordPageModule
      )
  },
  {
    path: "account-bind",
    loadChildren: () =>
      import("./account-bind/account-bind.page.module").then(
        m => m.AccountBindPageModule
      )
  },
  {
    path: "account-mobile",
    loadChildren: () =>
      import("./account-mobile/account-mobile.module").then(
        m => m.AccountMobilePageModule
      )
  },
  {
    path: "account-mobile_en",
    loadChildren: () =>
      import("./account-mobile-en/account-mobile-en.module").then(
        m => m.AccountMobileEnPageModule
      )
  },
  {
    path: 'account-items',
    loadChildren: () => import('./account-items/account-items.module').then( m => m.AccountItemsPageModule)
  },
  {
    path: 'account-items_en',
    loadChildren: () => import('./account-items-en/account-items-en.module').then( m => m.AccountItemsEnPageModule)
  }

];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {}
