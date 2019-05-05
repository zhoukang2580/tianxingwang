import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "account-bind",
        loadChildren: "./account-bind.page.module#BindPageModule"
      }
    ])
  ],
  exports: [RouterModule]
})
export class BindModule {}
