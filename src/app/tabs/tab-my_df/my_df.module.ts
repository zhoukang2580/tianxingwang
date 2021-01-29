import { IonicModule } from "@ionic/angular";
import { RouterModule, Route } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MyDfPage } from "./my_df.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { StylePageGuard } from "src/app/guards/style-page.guard";
let routes: Route[] = [
  {
    path: "",
    component: MyDfPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AppComponentsModule,
  ],
  declarations: [MyDfPage],
})
export class MyDfPageModule {}
