import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { AuthorityGuard } from "../guards/authority.guard";
import { AppHelper } from "../appHelper";
import { BindModule } from "./account-bind/account-bind.module";

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
    path: "account-dingding",
    loadChildren:
      "./account-dingding/account-dingding.module#AccountDingdingPageModule"
  },
  {
    path: "account-weixin",
    loadChildren:
      "./account-weixin/account-weixin.module#AccountWeixinPageModule"
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
    path: "change-password-by-msm-code",
    loadChildren:
      "./change-password-by-msm-code/change-password-by-msm-code.module#ChangePasswordByMsmCodePageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, BindModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {}
