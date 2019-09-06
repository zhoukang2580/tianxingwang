import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { IonicModule } from "@ionic/angular";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SwitchStationComponent } from "./switch-station/switch-station.component";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { SelectedTrainSegmentInfoComponent } from "./selected-train-segment-info/selected-train-segment-info.component";
import { TrainListItemComponent } from "./train-list-item/train-list-item.component";
import { TrainscheduleComponent } from "./trainschedule/trainschedule.component";
import { TimeSpanComponent } from "./train-filter/time-span/time-span.component";
import { TrainFilterComponent } from "./train-filter/train-filter.component";

@NgModule({
  declarations: [
    SwitchStationComponent,
    TrainListItemComponent,
    SelectedTrainSegmentInfoComponent,
    TrainscheduleComponent,
    TimeSpanComponent,
    TrainFilterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AppDirectivesModule,
    AppComponentsModule,
    TmcComponentsModule
  ],
  exports: [
    SwitchStationComponent,
    TrainListItemComponent,
    TrainscheduleComponent,
    TimeSpanComponent,
    TrainFilterComponent,
    SelectedTrainSegmentInfoComponent
  ],
  entryComponents: [
    SelectedTrainSegmentInfoComponent,
    TrainscheduleComponent,
    TrainFilterComponent
  ]
})
export class TrainComponentsModule {}
