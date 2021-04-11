import { AppDirectivesModule } from 'src/app/directives/directives.module';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { LoginPage } from "./login.page";
import { AppComponentsModule } from "../components/appcomponents.module";
import { StylePageGuard } from '../guards/style-page.guard';

const routes: Routes = [
  {
    path: "",
    component: LoginPage,
    canActivate: [StylePageGuard]
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
  declarations: [LoginPage]
})
export class LoginPageModule {}
