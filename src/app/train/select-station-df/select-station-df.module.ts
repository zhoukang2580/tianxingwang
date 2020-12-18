import { AppComponentsModule } from "./../../components/appcomponents.module";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { SelectTrainStationDfPage } from "./select-station-df.page";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";

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
        canDeactivate: [CandeactivateGuard]
      }
    ])
  ],
  declarations: [SelectTrainStationDfPage]
})
export class SelectStationDfPageModule {}
