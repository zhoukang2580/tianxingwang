import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { BindModule } from "./account-bind/account-bind.module";
import { AuthorityGuard } from '../guards/authority.guard';

const routes: Routes = [
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
    path: "account-password-by-msm-code",
    loadChildren:
      './account-password-by-msm-code/account-password-by-msm-code.module#AccountPasswordByMsmCodePageModule'
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, BindModule, RouterModule.forChild(routes
    .map(r => ({ ...r, canActivate: [AuthorityGuard] })))],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
