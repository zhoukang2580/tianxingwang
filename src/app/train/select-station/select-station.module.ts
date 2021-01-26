import { AppComponentsModule } from "./../../components/appcomponents.module";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { SelectTrainStationPage } from "./select-station.page";
import { StylePageGuard } from "src/app/guards/style-page.guard";

@NgModule({
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: SelectTrainStationPage,
        canActivate:[StylePageGuard]
      }
    ])
  ],
  declarations: [SelectTrainStationPage]
})
export class SelectStationPageModule {}
