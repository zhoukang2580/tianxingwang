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
        path: "login_en",
        loadChildren: () =>
          import("./login-en.page.module").then(m => m.LoginEnPageModule)
      }
    ]),
    AppComponentsModule
  ],
  exports: [RouterModule]
})
export class LoginEnModule {}
