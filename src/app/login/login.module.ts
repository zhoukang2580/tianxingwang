import { AppHelper } from "src/app/appHelper";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: "login", loadChildren: "./login.page.module#LoginPageModule" }
    ]),
  ],
  exports: [RouterModule]
})
export class LoginModule {}
