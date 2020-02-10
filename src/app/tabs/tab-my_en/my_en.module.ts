import { IonicModule } from "@ionic/angular";
import { RouterModule, Route } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MyEnPage } from "./my_en.page";
import { AppDirectivesModule } from "src/app/directives/directives.module";
const routes: Route[] = [{ path: "", component: MyEnPage }];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // TranslateModule.forChild(),
    RouterModule.forChild(routes),
    AppDirectivesModule
  ],
  declarations: [MyEnPage]
})
export class MyEnPageModule {}
