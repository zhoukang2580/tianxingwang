import { IonicModule } from "@ionic/angular";
import { RouterModule, Route } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MyEnPage } from "./my_en.page";
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { StylePageGuard } from 'src/app/guards/style-page.guard';
const routes: Route[] = [{ path: "", component: MyEnPage ,canActivate:[StylePageGuard]}];

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
