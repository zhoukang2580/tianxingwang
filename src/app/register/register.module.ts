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
        path: "register",
        loadChildren: () =>
          import("./register.page.module").then(m => m.RegisterPageModule)
      }
    ]),
    AppComponentsModule
  ],
  exports: [RouterModule]
})
export class RegisterModule {}
