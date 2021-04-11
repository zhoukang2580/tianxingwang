import { FlightComponentsModule } from "./../components/components.module";
import { AppComponentsModule } from "./../../components/appcomponents.module";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { SelectedFlightBookInfosPage } from "./selected-flight-bookinfos.page";
import { StylePageGuard } from "src/app/guards/style-page.guard";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FlightComponentsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: SelectedFlightBookInfosPage,
        canActivate: [StylePageGuard],
      },
    ]),
  ],
  declarations: [SelectedFlightBookInfosPage],
})
export class SelectedFlightBookInfosPageModule {}
