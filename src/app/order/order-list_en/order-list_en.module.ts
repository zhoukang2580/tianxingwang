import { OrderComponentsModule } from "../components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { OrderListEnPage } from "./order-list_en.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: OrderListEnPage,
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
    AppComponentsModule,
  ],
  declarations: [OrderListEnPage],
})
export class OrderListEnPageModule {}
