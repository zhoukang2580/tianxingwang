import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AccountEmailEnPage } from "./account-email-en.page";
import { AuthorityGuard } from "src/app/guards/authority.guard";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { StylePageGuard } from "src/app/guards/style-page.guard";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthorityGuard, StylePageGuard],
    component: AccountEmailEnPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
  ],
  declarations: [AccountEmailEnPage],
})
export class AccountEmailEnPageModule {}
