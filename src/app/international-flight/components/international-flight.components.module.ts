import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { FlightDialogComponent } from "./flight-dialog/flight-dialog.component";
import { IonicModule } from "@ionic/angular";
import { DirectFlyComponent } from "./flight-dialog/direct-fly/direct-fly.component";
import { AirCompanyComponent } from "./flight-dialog/air-company/air-company.component";
import { TakeoffLandingAirportComponent } from "./flight-dialog/takeoff-landing-airport/takeoff-landing-airport.component";
import { TakeoffTimeComponent } from "./flight-dialog/takeoff-time/takeoff-time.component";

import { FormsModule } from "@angular/forms";
import { FlightListItemComponent } from "./flight-list-item/flight-list-item.component";
import { FlightTransferComponent } from "./flight-transfer/flight-transfer.component";
import { RefundChangeDetailComponent } from "./refund-change-detail/refund-change-detail.component";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { InternationalFlightOutNumberComponent } from "./internationalflight-outnumber/internationalflight-outnumber.component";
import { InterFlightBookAddcontactsCompComponent } from "./interflightbook-addcontacts/interflightbook-addcontacts.component";

@NgModule({
  declarations: [
    FlightDialogComponent,
    DirectFlyComponent,
    InternationalFlightOutNumberComponent,
    InterFlightBookAddcontactsCompComponent,
    AirCompanyComponent,
    TakeoffLandingAirportComponent,
    TakeoffTimeComponent,
    FlightListItemComponent,
    FlightTransferComponent,
    RefundChangeDetailComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    TmcComponentsModule,
    FormsModule,
    AppComponentsModule,
  ],
  exports: [
    TmcComponentsModule,
    FlightDialogComponent,
    FlightListItemComponent,
    FlightTransferComponent,
    InternationalFlightOutNumberComponent,
    InterFlightBookAddcontactsCompComponent,
  ],
})
export class InternationalFlightComponentsModule {}
