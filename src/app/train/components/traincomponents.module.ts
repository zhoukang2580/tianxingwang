import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { DirectivesModule } from "src/app/directives/directives.module";
import { IonicModule } from "@ionic/angular";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SwitchStationComponent } from "./switch-station/switch-station.component";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { SelectedTrainSegmentInfoComponent } from "./selected-train-segment-info/selected-train-segment-info.component";
import { TrainListItemComponent } from "./train-list-item/train-list-item.component";

@NgModule({
  declarations: [
    SwitchStationComponent,
    TrainListItemComponent,
    SelectedTrainSegmentInfoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    DirectivesModule,
    AppComponentsModule,
    TmcComponentsModule
  ],
  exports: [SwitchStationComponent, TrainListItemComponent],
  entryComponents: [SelectedTrainSegmentInfoComponent]
})
export class TrainComponentsModule {}
