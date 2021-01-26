import { AppComponentsModule } from "./../../components/appcomponents.module";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { SelectTrainStationDfPage } from "./select-station-df.page";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";
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
        component: SelectTrainStationDfPage,
        canActivate:[StylePageGuard],
        canDeactivate: [CandeactivateGuard]
      }
    ])
  ],
  declarations: [SelectTrainStationDfPage]
})
export class SelectStationDfPageModule {}
