import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AccountSecurityEnPage } from "./account-security-en.page";
import { AuthorityGuard } from "src/app/guards/authority.guard";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { StylePageGuard } from "src/app/guards/style-page.guard";

const routes: Routes = [
  {
    path: "",
    component: AccountSecurityEnPage,
    canActivate: [AuthorityGuard, StylePageGuard],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
  ],
  declarations: [AccountSecurityEnPage],
})
export class AccountSecurityEnPageModule {}
