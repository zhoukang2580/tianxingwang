import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { HotelComponentsModule } from "../components/components.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { BookDfPage } from "./book-df.page";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';
import { MemberPipesModule } from 'src/app/member/pipe/pipe.module';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: BookDfPage,
    canActivate: [ConfirmCredentialInfoGuard,StylePageGuard]
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
    AppComponentsModule,
    MemberPipesModule
  ],
  declarations: [BookDfPage]
})
export class BookDfPageModule { }
