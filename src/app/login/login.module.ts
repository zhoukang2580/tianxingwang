import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AppComponentsModule } from "../components/appcomponents.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: "login",
        loadChildren: () =>
          import("./login.page.module").then(m => m.LoginPageModule)
      }
    ]),
    AppComponentsModule
  ],
  exports: [RouterModule]
})
export class LoginModule {}
