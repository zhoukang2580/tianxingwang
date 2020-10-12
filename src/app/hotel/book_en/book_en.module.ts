import { StylePageGuard } from './../../guards/style-page.guard';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { HotelComponentsModule } from "./../components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { BookEnPage } from "./book_en.page";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';

const routes: Routes = [
  {
    path: "",
    component: BookEnPage,
    canActivate: [ConfirmCredentialInfoGuard, StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TmcComponentsModule,
    HotelComponentsModule,
    AppComponentsModule
  ],
  declarations: [BookEnPage]
})
export class BookEnPageModule { }
