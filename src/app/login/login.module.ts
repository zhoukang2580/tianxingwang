
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AppComponentsModule } from '../components/appcomponents.module';
import { DirectivesModule } from '../directives/directives.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: "login", loadChildren: "./login.page.module#LoginPageModule" }
    ]),
    AppComponentsModule,
    DirectivesModule
  ],
  exports: [RouterModule]
})
export class LoginModule {}
