import { IonicModule } from "@ionic/angular";
import { RouterModule, Route } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MyPage } from "./my.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
let routes: Route[] = [{ path: "", component: MyPage }];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
  ],
  declarations: [MyPage],
})
export class MyPageModule {}
