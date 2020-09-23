import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AccountItemsPageRoutingModule } from "./account-items-routing.module";

import { AccountItemsPage } from "./account-items.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    AccountItemsPageRoutingModule,
  ],
  declarations: [AccountItemsPage],
})
export class AccountItemsPageModule {}
