import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { FlightDialogComponent } from './flight-dialog/flight-dialog.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [FlightDialogComponent],
  imports: [CommonModule, TmcComponentsModule,FlightDialogComponent, IonicModule],
  exports: [TmcComponentsModule,FlightDialogComponent]
})
export class InternationalFlightComponentsModule {}
