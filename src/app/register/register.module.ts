
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AppComponentsModule } from '../components/appcomponents.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: "register", loadChildren: "./register.page.module#RegisterPageModule" }
    ]),
    AppComponentsModule
  ],
  exports: [RouterModule]
})
export class RegisterModule {}