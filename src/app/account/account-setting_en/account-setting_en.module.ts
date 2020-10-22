import { StylePageGuard } from './../../guards/style-page.guard';
import { AppComponentsModule } from "../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AccountSettingEnPage } from "./account-setting_en.page";
import { AuthorityGuard } from "src/app/guards/authority.guard";

const routes: Routes = [
  {
    path: "",
    component: AccountSettingEnPage,
    canActivate: [AuthorityGuard,StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule
  ],
  declarations: [AccountSettingEnPage]
})
export class AccountSettingEnPageModule {}
