import { AppComponentsModule } from "../../components/appcomponents.module";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { SelectedConfirmBookInfosGpPage } from "./selected-confirm-bookinfos-gp.page";
import { StylePageGuard } from "src/app/guards/style-page.guard";
import { FlightGpComponentsModule } from "../components/components.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FlightGpComponentsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: SelectedConfirmBookInfosGpPage,
        canActivate: [StylePageGuard],
      },
    ]),
  ],
  declarations: [SelectedConfirmBookInfosGpPage],
})
export class SelectedConfirmBookInfosGpPageModule {}
