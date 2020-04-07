import { AccountRoutingModule } from "./account-routing.module";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AccountBindPageModule } from "./account-bind/account-bind.page.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, AccountRoutingModule],
  exports: [AccountRoutingModule]
})
export class AccountModule {}
