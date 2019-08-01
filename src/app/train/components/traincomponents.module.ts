import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SelectedPassengersComponent } from "./selected-passengers/selected-passengers.component";
import { SelectTrainStationComponent } from "./select-station/select-station.component";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { DirectivesModule } from "src/app/directives/directives.module";
import { IonicModule } from "@ionic/angular";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SwitchStationComponent } from './switch-station/switch-station.component';

@NgModule({
  declarations: [
    SelectedPassengersComponent,
    SwitchStationComponent,
    SelectTrainStationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    DirectivesModule,
    AppComponentsModule
  ],
  exports: [SelectedPassengersComponent, SelectTrainStationComponent,SwitchStationComponent],
  entryComponents: [SelectedPassengersComponent, SelectTrainStationComponent]
})
export class TrainComponentsModule {}
