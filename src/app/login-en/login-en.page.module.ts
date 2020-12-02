import { AppDirectivesModule } from 'src/app/directives/directives.module';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { LoginEnPage } from "./login-en.page";
import { AppComponentsModule } from "../components/appcomponents.module";
import { StylePageGuard } from '../guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: LoginEnPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
    AppDirectivesModule
  ],
  declarations: [LoginEnPage]
})
export class LoginEnPageModule {}
