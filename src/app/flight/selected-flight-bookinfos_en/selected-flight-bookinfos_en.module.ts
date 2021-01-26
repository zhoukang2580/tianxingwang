import { FlightComponentsModule } from "./../components/components.module";
import { AppComponentsModule } from "./../../components/appcomponents.module";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { SelectedFlightBookInfosEnPage } from "./selected-flight-bookinfos_en.page";
import { StylePageGuard } from "src/app/guards/style-page.guard";

@NgModule({
  // tslint:disable-next-line:max-line-length
  imports: [
    IonicModule,
    CommonModule,
    FlightComponentsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: SelectedFlightBookInfosEnPage,
        canActivate: [StylePageGuard],
      },
    ]),
  ],
  declarations: [SelectedFlightBookInfosEnPage],
})
export class SelectedFlightBookInfosEnPageModule {}
