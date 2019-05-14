import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { AccountBindPage } from "./account-bind.page";
import { AuthorityGuard } from 'src/app/guards/authority.guard';

const routes: Routes = [
  {
    path: "",
    component: AccountBindPage,
    canActivate:[AuthorityGuard]
  }
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AccountBindPage],
  exports: []
})
export class AccountBindPageModule {}
