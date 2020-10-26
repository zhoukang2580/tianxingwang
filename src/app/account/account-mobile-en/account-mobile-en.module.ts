import { AuthorityGuard } from "src/app/guards/authority.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AccountMobileEnPage } from "./account-mobile-en.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { StylePageGuard } from "src/app/guards/style-page.guard";

const routes: Routes = [
  {
    path: "",
    component: AccountMobileEnPage,
    canActivate: [AuthorityGuard, StylePageGuard],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
  ],
  declarations: [AccountMobileEnPage],
})
export class AccountMobileEnPageModule {}
