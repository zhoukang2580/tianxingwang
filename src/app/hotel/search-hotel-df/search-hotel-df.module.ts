import { StylePageGuard } from '../../guards/style-page.guard';
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { SearchHotelDfPage } from "./search-hotel-df.page";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';
import { AuthorityGuard } from 'src/app/guards/authority.guard';

const routes: Routes = [
  {
    path: "",
    component: SearchHotelDfPage,
    canActivate: [AuthorityGuard,ConfirmCredentialInfoGuard,StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
    TmcComponentsModule
  ],
  declarations: [SearchHotelDfPage]
})
export class SearchHotelDfPageModule {}
