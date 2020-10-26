import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AccountItemsEnPageRoutingModule } from "./account-items-en-routing.module";

import { AccountItemsEnPage } from "./account-items-en.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    AccountItemsEnPageRoutingModule,
  ],
  declarations: [AccountItemsEnPage],
})
export class AccountItemsEnPageModule {}
