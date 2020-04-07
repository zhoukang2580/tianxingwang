import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { FlightDialogComponent } from "./flight-dialog/flight-dialog.component";
import { IonicModule } from "@ionic/angular";
import { DirectFlyComponent } from './flight-dialog/direct-fly/direct-fly.component';
import { AirCompanyComponent } from './flight-dialog/air-company/air-company.component';
import { TakeoffLandingAirportComponent } from './flight-dialog/takeoff-landing-airport/takeoff-landing-airport.component';
import { TakeoffTimeComponent } from './flight-dialog/takeoff-time/takeoff-time.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [FlightDialogComponent,DirectFlyComponent,AirCompanyComponent,TakeoffLandingAirportComponent,TakeoffTimeComponent],
  imports: [CommonModule, IonicModule, TmcComponentsModule,FormsModule],
  exports: [TmcComponentsModule, FlightDialogComponent],
})
export class InternationalFlightComponentsModule {}
