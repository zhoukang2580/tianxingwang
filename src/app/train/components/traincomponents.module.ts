import { SelectAndReplaceTrainInfoComponent } from './select-and-replaceinfo/select-and-replaceinfo.component';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { AppDirectivesModule } from "src/app/directives/directives.module";
import { IonicModule } from "@ionic/angular";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { SelectedTrainSegmentInfoComponent } from "./selected-train-segment-info/selected-train-segment-info.component";
import { TrainListItemComponent } from "./train-list-item/train-list-item.component";
import { TrainscheduleComponent } from "./trainschedule/trainschedule.component";
import { TimeSpanComponent } from "./train-filter/time-span/time-span.component";
import { TrainFilterComponent } from "./train-filter/train-filter.component";
import { SeatPickerComponent } from './seat-picker/seat-picker.component';
import { TrainRefundComponent } from './train-refund/train-refund.component';
import { TrainTicketComponent } from './train-ticket/train-ticket.component';
import { TrainListItemEnComponent } from './train-list-item_en/train-list-item_en.component';

@NgModule({
  declarations: [
    TrainListItemComponent,
    TrainListItemEnComponent,
    SelectedTrainSegmentInfoComponent,
    TrainscheduleComponent,
    TimeSpanComponent,
    TrainFilterComponent,
    SeatPickerComponent,
    TrainRefundComponent,
    TrainTicketComponent,
    SelectAndReplaceTrainInfoComponent
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
    TrainListItemComponent,
    TrainListItemEnComponent,
    TrainscheduleComponent,
    TimeSpanComponent,
    TrainFilterComponent,
    SelectedTrainSegmentInfoComponent,
    SeatPickerComponent,
    TrainTicketComponent
  ],
  entryComponents: [
    SelectedTrainSegmentInfoComponent,
    TrainscheduleComponent,
    TrainFilterComponent,
    TrainRefundComponent,
    SelectAndReplaceTrainInfoComponent
  ]
})
export class TrainComponentsModule {}
