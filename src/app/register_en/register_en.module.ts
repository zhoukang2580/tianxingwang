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
        path: "register_en",
        loadChildren: () =>
          import("./register_en.page.module").then(m => m.RegisterEnPageModule)
      }
    ]),
    AppComponentsModule,
  ],
  exports: [RouterModule]
})
export class RegisterEnModule {}
