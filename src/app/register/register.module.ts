
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AppcomponentsModule } from '../components/appcomponents.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: "register", loadChildren: "./register.page.module#RegisterPageModule" }
    ]),
    AppcomponentsModule
  ],
  exports: [RouterModule]
})
export class RegisterModule {}