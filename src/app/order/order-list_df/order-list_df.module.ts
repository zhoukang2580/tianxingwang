import { OrderComponentsModule } from "../components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { OrderListDfPage } from "./order-list_df.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { StylePageGuard } from "src/app/guards/style-page.guard";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";

const routes: Routes = [
  {
    path: "",
    component: OrderListDfPage,
    canDeactivate: [CandeactivateGuard],
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    OrderComponentsModule,
    TmcComponentsModule,
    AppComponentsModule,
  ],
  declarations: [OrderListDfPage],
})
export class OrderListDfPageModule {}
