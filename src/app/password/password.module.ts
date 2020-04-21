import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
const routes: Routes = [
  {
    path: "password-check",
    loadChildren: () =>
      import("./password-check/password-check.module").then(
        m => m.PasswordCheckPageModule
      )
  },
  {
    path: "password-valid",
    loadChildren: () =>
      import("./password-valid/password-valid.module").then(
        m => m.PasswordValidPageModule
      )
  },
  {
    path: "password-reset",
    loadChildren: () =>
      import("./password-reset/password-reset.module").then(
        m => m.PasswordResetPageModule
      )
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PasswordModule {}
