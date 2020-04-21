import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { HotelComponentsModule } from "./../components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { BookPage } from "./book.page";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';

const routes: Routes = [
  {
    path: "",
    component: BookPage,
    canActivate: [ConfirmCredentialInfoGuard]
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
  declarations: [BookPage]
})
export class BookPageModule { }
